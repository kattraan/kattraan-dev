import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  PictureInPicture2,
  ChevronRight,
} from 'lucide-react';
import {
  formatTime,
  formatDuration,
  PLAYBACK_RATES,
  LMS_PLAYBACK_SPEED_KEY,
} from '@/utils/videoUtils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import courseService from '@/features/courses/services/courseService';

/** Returns true if the URL points to an HLS manifest. */
function isHlsUrl(url) {
  if (!url) return false;
  const lower = url.split('?')[0].toLowerCase();
  return lower.endsWith('.m3u8');
}

function getStoredPlaybackSpeed() {
  try {
    const v = localStorage.getItem(LMS_PLAYBACK_SPEED_KEY);
    const n = parseFloat(v, 10);
    if (Number.isFinite(n) && PLAYBACK_RATES.includes(n)) return n;
  } catch (_) {}
  return 1;
}

function setStoredPlaybackSpeed(rate) {
  try {
    localStorage.setItem(LMS_PLAYBACK_SPEED_KEY, String(rate));
  } catch (_) {}
}

/** If still loading after this, clear spinner so user can interact (e.g. retry play). */
const LOADING_TIMEOUT_MS = 20000;

export default function LMSVideoPlayer({
  activeChapter,
  posterUrl,
  autoPlay = false,
  initialTime = 0,
  isCompleted = false,
  onPlaybackStateChange,
  onEnded,
  onTheaterModeToggle,
  isTheaterMode = false,
  className = '',
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const userEmail = useSelector((state) => state.auth?.user?.email ?? '');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(getStoredPlaybackSpeed);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [error, setError] = useState(null);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const hasResumedRef = useRef(false);
  /** User intent: false after explicit pause; true after explicit play. Prevents canplay/buffer from auto-resuming. */
  const userWantsPlaybackRef = useRef(autoPlay);

  const [watermark, setWatermark] = useState(() => ({
    top: 12,
    left: 10,
    ts: new Date().toLocaleString(),
  }));

  const videoContent = activeChapter?.contents?.find((c) => c.type === 'video');
  const videoContentId = videoContent?._id || videoContent?.id;
  const chapterId = activeChapter?._id || activeChapter?.id;
  const title = activeChapter?.title || 'Lesson video';
  const contentDuration = typeof videoContent?.duration === 'number' && videoContent.duration > 0 ? videoContent.duration : 0;

  // Legacy: if chapter content still includes videoUrl (e.g. instructor preview), use it
  const legacyVideoUrl = videoContent?.videoUrl;
  const videoUrl = playbackUrl || legacyVideoUrl;

  const hlsRef = useRef(null);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userWantsPlaybackRef.current = true;
      video.play().catch(() => setError(new Error('Playback failed')));
    } else {
      userWantsPlaybackRef.current = false;
      video.pause();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setIsPlaying(!video.paused);
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
      if (video.buffered?.length) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
      onPlaybackStateChange?.({
        currentTime: video.currentTime,
        duration: video.duration,
        isPlaying: !video.paused,
      });
    }
  }, [onPlaybackStateChange]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) setDuration(video.duration);
  }, []);

  /** Duration can arrive late with 206/range requests; keep duration in sync. */
  const handleDurationChange = useCallback(() => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) setDuration(video.duration);
    if (video && autoPlay && userWantsPlaybackRef.current) {
      video.play().catch(() => {
        /* Autoplay often blocked when chapter was chosen from sidebar (no gesture on <video>). */
      });
    }
  }, [autoPlay]);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) setDuration(video.duration);
  }, []);
  const handlePlaying = useCallback(() => {
    setIsPlaying(true);
    setIsLoading(false);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) setDuration(video.duration);
  }, []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      onPlaybackStateChange?.({
        currentTime: video.currentTime,
        duration: video.duration,
        isPlaying: !video.paused,
      });
    }
  }, [onPlaybackStateChange]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((e) => {
    const video = e.target;
    setError(
      video?.error
        ? new Error(video.error.message || 'Video failed to load')
        : new Error('Video error')
    );
    setIsLoading(false);
  }, []);

  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    const value = parseFloat(e.target.value, 10);
    if (video && Number.isFinite(value)) {
      video.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const value = parseFloat(e.target.value, 10);
    const video = videoRef.current;
    setVolume(value);
    if (video) video.volume = value;
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 1;
      setVolume(volume || 1);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const togglePiP = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().then(() => setIsPiP(false)).catch(() => {});
    } else if (document.pictureInPictureEnabled) {
      video.requestPictureInPicture().then(() => setIsPiP(true)).catch(() => {});
    }
  }, []);

  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled;

  const setRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setPlaybackRate(rate);
    setStoredPlaybackSpeed(rate);
    setShowSpeedMenu(false);
  }, []);

  const seekForward = useCallback(() => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }, []);
  const seekBackward = useCallback(() => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const handleCanPlayWithResume = useCallback(() => {
    handleCanPlay();
    const video = videoRef.current;
    if (video && initialTime > 0 && !hasResumedRef.current) {
      hasResumedRef.current = true;
      video.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  }, [initialTime, handleCanPlay]);

  useKeyboardShortcuts(containerRef, {
    onPlayPause: togglePlay,
    onSeekForward: seekForward,
    onSeekBackward: seekBackward,
    onFullscreen: toggleFullscreen,
    onMute: toggleMute,
  });

  // Watermark: update position and timestamp every 10s to deter cropping
  useEffect(() => {
    const update = () => {
      setWatermark({
        top: 5 + Math.random() * 80,
        left: 5 + Math.random() * 80,
        ts: new Date().toLocaleString(),
      });
    };
    const t = setInterval(update, 10000);
    update();
    return () => clearInterval(t);
  }, [videoContentId]);

  // If source hangs, stop holding internal loading flag (controls stay usable)
  useEffect(() => {
    if (!videoUrl || !isLoading) return;
    const t = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [videoUrl, isLoading]);

  // New lesson: allow autoplay again until user pauses
  useEffect(() => {
    userWantsPlaybackRef.current = autoPlay;
  }, [videoContentId, autoPlay]);

  // Secure video access: fetch signed playback URL once per video content.
  // Do NOT periodically setPlaybackUrl — changing React state remounts HLS and resets playback (~45s with old refresh).
  useEffect(() => {
    if (!videoContentId) {
      setPlaybackUrl(null);
      return;
    }
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const res = await courseService.getVideoPlayUrlByVideoId(videoContentId);
        const url = res?.playbackUrl ?? res?.data?.playbackUrl;
        if (!cancelled && url) setPlaybackUrl(url);
      } catch {
        if (!cancelled) setError(new Error('Could not load video. Check enrollment.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoContentId]);

  // Source change: attach HLS.js for m3u8 streams or fall back to native src
  useEffect(() => {
    if (!videoUrl) return;

    hasResumedRef.current = false;
    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(contentDuration);
    setBufferedEnd(0);

    const video = videoRef.current;
    if (!video) return;

    // Destroy any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsUrl(videoUrl)) {
      if (Hls.isSupported()) {
        const hls = new Hls({ startLevel: -1, autoLevelEnabled: true });
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
          const details = data.details;
          if (details?.fragments?.length && !details.live) {
            const total = details.fragments.reduce((acc, f) => acc + (f.duration || 0), 0);
            if (total > 0) setDuration(total);
          }
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            if (videoContentId && (data.type === Hls.ErrorTypes.NETWORK_ERROR || data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR)) {
              courseService.getVideoPlayUrlByVideoId(videoContentId)
                .then((res) => {
                  const newUrl = res?.playbackUrl ?? res?.data?.playbackUrl;
                  if (newUrl && hlsRef.current) {
                    hlsRef.current.loadSource(newUrl);
                    setError(null);
                  } else {
                    setError(new Error('HLS stream error – please retry'));
                    setIsLoading(false);
                  }
                })
                .catch(() => {
                  setError(new Error('HLS stream error – please retry'));
                  setIsLoading(false);
                });
            } else {
              setError(new Error('HLS stream error – please retry'));
              setIsLoading(false);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        video.src = videoUrl;
        video.load();
      } else {
        setError(new Error('HLS playback is not supported in this browser'));
        setIsLoading(false);
      }
    } else {
      // Standard MP4 / WebM
      video.src = videoUrl;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, contentDuration, videoContentId]);

  // After metadata load, seek to initialTime (resume) and apply playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    const rate = getStoredPlaybackSpeed();
    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, [videoUrl]);

  // Sync PiP state when user exits PiP from browser
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLeavePiP = () => setIsPiP(false);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    return () => video.removeEventListener('leavepictureinpicture', onLeavePiP);
  }, [videoUrl]);

  if (!videoContentId && !legacyVideoUrl) {
    return (
      <div
        className={`aspect-video w-full bg-gray-200 dark:bg-[#121212] flex flex-col items-center justify-center rounded-xl transition-colors duration-300 ${className}`}
      >
        <p className="text-gray-500 dark:text-white/40 text-sm">No video for this lesson</p>
      </div>
    );
  }

  if (videoContentId && !videoUrl) {
    return (
      <div
        className={`aspect-video w-full bg-black flex flex-col items-center justify-center rounded-xl ${className}`}
      >
        <Loader2 size={32} className="text-white animate-spin mb-2" />
        <p className="text-white/60 text-sm">Loading video…</p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black overflow-hidden rounded-none shadow-none transition-colors duration-300 ${className}`}
      tabIndex={0}
    >
      {/* src is managed programmatically (HLS.js or video.src) – no JSX src prop */}
      <video
        ref={videoRef}
        poster={posterUrl}
        title={title}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlayWithResume}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Dynamic watermark: position changes every 10s to prevent cropping */}
      {(userEmail || watermark.ts) && (
        <div
          className="absolute z-[8] pointer-events-none text-white/70 text-[10px] sm:text-xs font-medium whitespace-nowrap drop-shadow-md"
          style={{
            top: `${watermark.top}%`,
            left: `${watermark.left}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {userEmail && <span className="block truncate max-w-[180px]">{userEmail}</span>}
          <span>{watermark.ts}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 dark:bg-black/90 z-20 gap-4 p-6 rounded-xl">
          <AlertCircle size={48} className="text-red-400" aria-hidden />
          <p className="text-white text-center text-sm">{error.message}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              const v = videoRef.current;
              if (v) v.load();
            }}
            className="px-4 py-2 rounded-lg bg-primary-pink/20 text-primary-pink font-semibold text-sm hover:bg-primary-pink/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Center play overlay when paused (no mid-player spinner — chapter switches stay calm) */}
      {!error && !isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-[5] flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
          aria-label="Play"
        >
          <span className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
            <Play size={28} className="text-black ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Click video to pause (YouTube-like) — overlay only over video, not controls */}
      {!error && isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute top-0 left-0 right-0 bottom-20 z-[5] cursor-pointer"
          aria-label="Pause"
        />
      )}

      {!error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 rounded-b-xl overflow-visible">
          {/* Progress bar area - keep rounded clip for bar only */}
          <div className="group/progress relative h-2 bg-white/10 cursor-pointer rounded-b-xl overflow-hidden">
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-150"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-primary-pink transition-all duration-150 rounded-r-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity border-2 border-primary-pink -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:appearance-none"
              aria-label="Seek"
            />
          </div>

          {/* Control bar */}
          <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 bg-black/85 backdrop-blur-sm">
            <button
              type="button"
              onClick={togglePlay}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary-pink/20 hover:scale-105 active:scale-95 transition-all duration-200 text-white shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={22} strokeWidth={2.5} />
              ) : (
                <Play size={22} className="ml-0.5" strokeWidth={2.5} fill="currentColor" />
              )}
            </button>

            <span className="text-sm font-medium text-white/90 tabular-nums min-w-[5rem] shrink-0">
              {formatTime(currentTime)} <span className="text-white/50">/</span> {formatDuration(duration)}
            </span>

            {/* Chapter label (YouTube-style) */}
            {title && (
              <div className="flex items-center gap-1 min-w-0 max-w-[40%] sm:max-w-[50%]" title={title}>
                <ChevronRight size={14} className="text-white/60 shrink-0" aria-hidden />
                <span className="text-xs sm:text-sm font-medium text-white/80 truncate">
                  {title}
                </span>
              </div>
            )}

            {isCompleted && (
              <span className="text-[10px] font-bold text-green-400 bg-green-400/15 px-2 py-1 rounded-md border border-green-400/30 shrink-0">
                COMPLETED
              </span>
            )}

            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 justify-end shrink-0">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX size={20} strokeWidth={2} />
                  ) : (
                    <Volume2 size={20} strokeWidth={2} />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="hidden sm:block w-20 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                  aria-label="Volume"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSpeedMenu((v) => !v)}
                  className={`px-2 sm:px-3 py-2 text-sm font-semibold rounded-lg min-w-[2.75rem] sm:min-w-[3.25rem] transition-colors bg-white/15 text-white hover:bg-primary-pink/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50 ${
                    showSpeedMenu ? 'bg-primary-pink/30 text-white ring-2 ring-primary-pink/50' : ''
                  }`}
                  aria-label="Playback speed"
                  aria-expanded={showSpeedMenu}
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      aria-hidden
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-30 min-w-[4.5rem] overflow-hidden">
                      {PLAYBACK_RATES.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setRate(rate)}
                          className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            playbackRate === rate
                              ? 'text-primary-pink font-semibold bg-primary-pink/10'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {onTheaterModeToggle && (
                <button
                  type="button"
                  onClick={onTheaterModeToggle}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                  aria-label={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
                  title={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
                >
                  {isTheaterMode ? (
                    <PanelRightOpen size={20} strokeWidth={2} />
                  ) : (
                    <PanelRightClose size={20} strokeWidth={2} />
                  )}
                </button>
              )}

              {pipSupported && (
                <button
                  type="button"
                  onClick={togglePiP}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors shrink-0 ${isPiP ? 'text-primary-pink bg-primary-pink/20' : 'text-white/90 hover:bg-white/10 hover:text-white'}`}
                  aria-label={isPiP ? 'Exit picture-in-picture' : 'Picture-in-picture'}
                  title={isPiP ? 'Exit picture-in-picture' : 'Picture-in-picture'}
                >
                  <PictureInPicture2 size={20} strokeWidth={2} />
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors shrink-0"
                aria-label="Fullscreen"
              >
                <Maximize size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
