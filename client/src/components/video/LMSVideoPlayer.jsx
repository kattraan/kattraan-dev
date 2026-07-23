import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  buildHlsQualityOptions,
  getStoredQualitySelection,
  setStoredQualitySelection,
  applyHlsQualitySelection,
  hasMultipleHlsQualities,
  createHlsConfigForBunnySignedUrl,
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

/** Reposition watermark every N seconds of playback. */
const WATERMARK_MOVE_INTERVAL_SEC = 10;

function randomWatermarkPosition() {
  return {
    top: 8 + Math.random() * 75,
    left: 8 + Math.random() * 84,
  };
}

export default function LMSVideoPlayer({
  activeChapter,
  posterUrl,
  autoPlay = false,
  initialTime = 0,
  maxSeekTime = null,
  restrictSeeking = false,
  isCompleted = false,
  onPlaybackStateChange,
  onEnded,
  onTheaterModeToggle,
  isTheaterMode = false,
  className = '',
}) {
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const previewHlsRef = useRef(null);
  const progressBarRef = useRef(null);
  const hoverSeekRafRef = useRef(0);
  const lastPreviewSeekRef = useRef(-1);
  const containerRef = useRef(null);
  const qualityAnchorRef = useRef(null);
  const qualityMenuRef = useRef(null);
  const speedAnchorRef = useRef(null);
  const speedMenuRef = useRef(null);
  const [qualityMenuPos, setQualityMenuPos] = useState(null);
  const [speedMenuPos, setSpeedMenuPos] = useState(null);
  const loginEmail = useSelector((state) => {
    const user = state.auth?.user;
    return user?.userEmail || user?.email || '';
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(getStoredPlaybackSpeed);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualityOptions, setQualityOptions] = useState([]);
  /** 'auto' or height string, e.g. '720' */
  const [selectedQualityId, setSelectedQualityId] = useState('auto');
  const [hlsQualityEnabled, setHlsQualityEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  /** Progress-bar hover: mini preview + exact time under cursor */
  const [seekHover, setSeekHover] = useState(null);
  const hasResumedRef = useRef(false);
  /** User intent: false after explicit pause; true after explicit play. Prevents canplay/buffer from auto-resuming. */
  const userWantsPlaybackRef = useRef(autoPlay);

  const [watermarkPos, setWatermarkPos] = useState(randomWatermarkPosition);
  const [wallClockTs, setWallClockTs] = useState(() => new Date().toLocaleString());
  const watermarkSegmentRef = useRef(-1);

  const videoContent = activeChapter?.contents?.find((c) => c.type === 'video');
  const videoContentId = videoContent?._id || videoContent?.id;
  const chapterId = activeChapter?._id || activeChapter?.id;
  const title = activeChapter?.title || 'Lesson video';
  const contentDuration = typeof videoContent?.duration === 'number' && videoContent.duration > 0 ? videoContent.duration : 0;

  // Legacy: if chapter content still includes videoUrl (e.g. instructor preview), use it
  const legacyVideoUrl = videoContent?.videoUrl;
  const videoUrl = playbackUrl || legacyVideoUrl;

  const hlsRef = useRef(null);
  const hlsManifestRetryRef = useRef(0);
  const lastPlaybackUrlRef = useRef(null);
  const lastAllowedTimeRef = useRef(0);

  const getSeekCeiling = useCallback(() => {
    if (!restrictSeeking || isCompleted) return Infinity;
    const serverCeiling = Number(maxSeekTime);
    const serverMax = Number.isFinite(serverCeiling) && serverCeiling >= 0 ? serverCeiling : 0;
    if (isPlaying) {
      return Math.max(serverMax, currentTime);
    }
    return serverMax;
  }, [restrictSeeking, isCompleted, maxSeekTime, isPlaying, currentTime]);

  const clampSeekTime = useCallback(
    (time) => {
      const video = videoRef.current;
      const safeTime = Math.max(0, Number(time) || 0);
      const ceiling = getSeekCeiling();
      const maxTime = video && Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(video.duration, ceiling)
        : ceiling;
      return Math.min(safeTime, maxTime);
    },
    [getSeekCeiling],
  );

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
      const ceiling = getSeekCeiling();
      if (
        restrictSeeking &&
        !isCompleted &&
        Number.isFinite(ceiling) &&
        video.currentTime > ceiling + 0.5
      ) {
        video.currentTime = ceiling;
        setCurrentTime(ceiling);
      } else {
        setCurrentTime(video.currentTime);
      }
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
  }, [onPlaybackStateChange, restrictSeeking, isCompleted, getSeekCeiling]);

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
      const clamped = clampSeekTime(value);
      video.currentTime = clamped;
      setCurrentTime(clamped);
    }
  }, [clampSeekTime]);

  const updateSeekHover = useCallback(
    (clientX) => {
      const bar = progressBarRef.current;
      if (!bar || !(duration > 0)) {
        setSeekHover(null);
        return;
      }
      const rect = bar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      let time = ratio * duration;
      if (restrictSeeking && !isCompleted) {
        time = Math.min(time, getSeekCeiling());
      }
      const percent = duration > 0 ? (time / duration) * 100 : 0;
      // Keep preview card on-screen
      const edgePad = 11; // ~ half of preview width as %
      const leftPercent = Math.min(100 - edgePad, Math.max(edgePad, percent));
      setSeekHover({ time, percent, leftPercent });

      const preview = previewVideoRef.current;
      if (preview && Number.isFinite(time) && Math.abs(time - lastPreviewSeekRef.current) >= 0.35) {
        lastPreviewSeekRef.current = time;
        try {
          preview.currentTime = time;
        } catch (_) {}
      }
    },
    [duration, restrictSeeking, isCompleted, getSeekCeiling],
  );

  const handleProgressMouseMove = useCallback(
    (e) => {
      if (hoverSeekRafRef.current) cancelAnimationFrame(hoverSeekRafRef.current);
      const x = e.clientX;
      hoverSeekRafRef.current = requestAnimationFrame(() => updateSeekHover(x));
    },
    [updateSeekHover],
  );

  const handleProgressMouseLeave = useCallback(() => {
    if (hoverSeekRafRef.current) cancelAnimationFrame(hoverSeekRafRef.current);
    hoverSeekRafRef.current = 0;
    lastPreviewSeekRef.current = -1;
    setSeekHover(null);
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

  /** User picked a quality — update UI first, then hls.js (never block UI on HLS errors). */
  const handleQualitySelect = useCallback((option) => {
    if (!option) return;
    setSelectedQualityId(option.id);
    setStoredQualitySelection(option.id === 'auto' ? 'auto' : option.height);
    setShowQualityMenu(false);
    const hls = hlsRef.current;
    if (hls) applyHlsQualitySelection(hls, option);
  }, []);

  const qualityButtonLabel =
    selectedQualityId === 'auto'
      ? 'Auto'
      : qualityOptions.find((o) => o.id === selectedQualityId)?.label ?? 'Auto';

  const seekForward = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = clampSeekTime(Math.min(video.duration, video.currentTime + 10));
    }
  }, [clampSeekTime]);
  const seekBackward = useCallback(() => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const handleCanPlayWithResume = useCallback(() => {
    handleCanPlay();
    const video = videoRef.current;
    if (video && initialTime > 0 && !hasResumedRef.current) {
      hasResumedRef.current = true;
      const resumeTime = clampSeekTime(initialTime);
      video.currentTime = resumeTime;
      setCurrentTime(resumeTime);
    }
  }, [initialTime, handleCanPlay, clampSeekTime]);

  useKeyboardShortcuts(containerRef, {
    onPlayPause: togglePlay,
    onSeekForward: seekForward,
    onSeekBackward: seekBackward,
    onFullscreen: toggleFullscreen,
    onMute: toggleMute,
  });

  const updateQualityMenuPos = useCallback(() => {
    const el = qualityAnchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setQualityMenuPos({
      left: Math.max(8, rect.right - 120),
      bottom: window.innerHeight - rect.top + 8,
    });
  }, []);

  const updateSpeedMenuPos = useCallback(() => {
    const el = speedAnchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpeedMenuPos({
      left: Math.max(8, rect.right - 72),
      bottom: window.innerHeight - rect.top + 8,
    });
  }, []);

  useEffect(() => {
    if (!showQualityMenu) {
      setQualityMenuPos(null);
      return;
    }
    updateQualityMenuPos();
    window.addEventListener('resize', updateQualityMenuPos);
    window.addEventListener('scroll', updateQualityMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateQualityMenuPos);
      window.removeEventListener('scroll', updateQualityMenuPos, true);
    };
  }, [showQualityMenu, updateQualityMenuPos]);

  useEffect(() => {
    if (!showSpeedMenu) {
      setSpeedMenuPos(null);
      return;
    }
    updateSpeedMenuPos();
    window.addEventListener('resize', updateSpeedMenuPos);
    window.addEventListener('scroll', updateSpeedMenuPos, true);
    return () => {
      window.removeEventListener('resize', updateSpeedMenuPos);
      window.removeEventListener('scroll', updateSpeedMenuPos, true);
    };
  }, [showSpeedMenu, updateSpeedMenuPos]);

  useEffect(() => {
    if (!showQualityMenu) return;
    const onClickOutside = (e) => {
      if (e.target.closest('[data-lms-quality-menu], [data-lms-quality-trigger]')) return;
      setShowQualityMenu(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener('click', onClickOutside);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', onClickOutside);
    };
  }, [showQualityMenu]);

  useEffect(() => {
    if (!showSpeedMenu) return;
    const onClickOutside = (e) => {
      if (e.target.closest('[data-lms-speed-menu], [data-lms-speed-trigger]')) return;
      setShowSpeedMenu(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener('click', onClickOutside);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', onClickOutside);
    };
  }, [showSpeedMenu]);

  // Reset watermark when the lesson changes
  useEffect(() => {
    watermarkSegmentRef.current = -1;
    setWatermarkPos(randomWatermarkPosition());
    setWallClockTs(new Date().toLocaleString());
  }, [videoContentId]);

  // Live date & time while the video is playing
  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => setWallClockTs(new Date().toLocaleString());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [isPlaying, videoContentId]);

  // Moving watermark: jump position every N seconds of playback time
  useEffect(() => {
    if (!isPlaying) return;
    const segment = Math.floor(currentTime / WATERMARK_MOVE_INTERVAL_SEC);
    if (segment === watermarkSegmentRef.current) return;
    watermarkSegmentRef.current = segment;
    setWatermarkPos(randomWatermarkPosition());
  }, [currentTime, isPlaying]);

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
        if (!cancelled && url) {
          lastPlaybackUrlRef.current = url;
          setPlaybackUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Could not load video. Check enrollment or re-upload if you changed Bunny accounts.';
          setError(new Error(msg));
        }
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
    setQualityOptions([]);
    setHlsQualityEnabled(false);
    setSelectedQualityId('auto');
    setShowQualityMenu(false);
    hlsManifestRetryRef.current = 0;

    const video = videoRef.current;
    if (!video) return;

    // Destroy any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsUrl(videoUrl)) {
      if (Hls.isSupported()) {
        const hls = new Hls(createHlsConfigForBunnySignedUrl(videoUrl));
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          const options = buildHlsQualityOptions(hls);
          setQualityOptions(options);
          setHlsQualityEnabled(hasMultipleHlsQualities(hls));

          const stored = getStoredQualitySelection();
          const optionToApply =
            stored === 'auto'
              ? options[0]
              : options.find((o) => o.height === stored) ?? options[0];
          setSelectedQualityId(optionToApply.id);
          applyHlsQualitySelection(hls, optionToApply);
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const hls = hlsRef.current;
          if (!hls) return;
          if (hls.autoLevelEnabled) {
            setSelectedQualityId('auto');
            return;
          }
          const level = hls.levels[data.level];
          if (level?.height) {
            setSelectedQualityId(String(level.height));
          }
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
          if (!data.fatal) return;

          const httpStatus = data.response?.code;
          if (httpStatus === 404) {
            setError(
              new Error(
                'Video playlist not found (404). The file may still be encoding, or this lesson was uploaded to a different Bunny account — re-upload the video in the course editor.'
              )
            );
            setIsLoading(false);
            return;
          }

          const canRetryManifest =
            videoContentId &&
            hlsManifestRetryRef.current < 1 &&
            (data.type === Hls.ErrorTypes.NETWORK_ERROR ||
              data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR);

          if (canRetryManifest) {
            hlsManifestRetryRef.current += 1;
            courseService
              .getVideoPlayUrlByVideoId(videoContentId)
              .then((res) => {
                const newUrl = res?.playbackUrl ?? res?.data?.playbackUrl;
                if (newUrl && hlsRef.current && newUrl !== lastPlaybackUrlRef.current) {
                  lastPlaybackUrlRef.current = newUrl;
                  setPlaybackUrl(newUrl);
                  setError(null);
                } else {
                  setError(
                    new Error(
                      'Could not load video stream. Confirm the video exists in Bunny Stream and encoding is finished.'
                    )
                  );
                  setIsLoading(false);
                }
              })
              .catch((err) => {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  'Could not refresh video playback URL.';
                setError(new Error(msg));
                setIsLoading(false);
              });
            return;
          }

          setError(new Error('HLS stream error – please retry'));
          setIsLoading(false);
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

  // Lightweight second stream for progress-bar hover preview (YouTube-style mini screen)
  useEffect(() => {
    const preview = previewVideoRef.current;
    if (!preview || !videoUrl) return undefined;

    if (previewHlsRef.current) {
      previewHlsRef.current.destroy();
      previewHlsRef.current = null;
    }
    lastPreviewSeekRef.current = -1;
    setSeekHover(null);

    if (isHlsUrl(videoUrl) && Hls.isSupported()) {
      const hls = new Hls({
        ...createHlsConfigForBunnySignedUrl(videoUrl),
        maxBufferLength: 8,
        maxMaxBufferLength: 12,
        autoStartLoad: true,
      });
      previewHlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(preview);
    } else {
      preview.src = videoUrl;
      preview.load();
    }

    return () => {
      if (previewHlsRef.current) {
        previewHlsRef.current.destroy();
        previewHlsRef.current = null;
      }
      preview.removeAttribute('src');
      preview.load();
    };
  }, [videoUrl]);

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

  // Keep local seek ceiling in sync with server-authoritative max watched time.
  useEffect(() => {
    lastAllowedTimeRef.current = getSeekCeiling();
  }, [getSeekCeiling, videoContentId]);

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
  const seekCeiling = getSeekCeiling();
  const watchedPercent = duration > 0 && Number.isFinite(seekCeiling) && seekCeiling < Infinity
    ? (seekCeiling / duration) * 100
    : 100;

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

      {/* Dynamic watermark: user email + live date/time while playing */}
      {isPlaying && (
        <div
          className="absolute z-[8] pointer-events-none text-white/75 text-[10px] sm:text-xs font-medium whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition-all duration-700 ease-in-out select-none"
          style={{
            top: `${watermarkPos.top}%`,
            left: `${watermarkPos.left}%`,
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden
        >
          {loginEmail && <span className="block truncate max-w-[220px]">{loginEmail}</span>}
          <span className="block tabular-nums">{wallClockTs}</span>
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
          className="absolute top-0 left-0 right-0 bottom-20 z-[5] flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
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
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-b-xl overflow-visible ${
            showQualityMenu || showSpeedMenu ? 'z-[50]' : 'z-10'
          }`}
        >
          {/* Progress bar area + YouTube-style hover preview */}
          <div
            ref={progressBarRef}
            className="relative py-2 -my-2"
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={handleProgressMouseLeave}
          >
            <div
              className={`absolute bottom-3 z-20 pointer-events-none flex flex-col items-center transition-opacity ${
                seekHover ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${seekHover?.leftPercent ?? 50}%`,
                transform: 'translateX(-50%)',
              }}
              aria-hidden={!seekHover}
            >
              <div className="w-36 sm:w-44 aspect-video rounded-md overflow-hidden bg-black border border-white/25 shadow-xl">
                <video
                  ref={previewVideoRef}
                  className="w-full h-full object-contain bg-black"
                  muted
                  playsInline
                  preload="metadata"
                />
              </div>
              <div className="mt-1.5 px-2 py-0.5 rounded bg-black/90 text-white text-xs font-medium tabular-nums shadow">
                {formatTime(seekHover?.time ?? 0)}
              </div>
            </div>
            <div className="group/progress relative h-2 bg-white/10 cursor-pointer rounded-b-xl overflow-hidden">
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-150"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Watched (seekable) region indicator */}
              {restrictSeeking && !isCompleted && watchedPercent < 100 && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-150"
                  style={{ width: `${watchedPercent}%` }}
                />
              )}
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
              {/* Hover position marker */}
              {seekHover && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/70 pointer-events-none"
                  style={{ left: `${seekHover.percent}%` }}
                />
              )}
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

              {hlsQualityEnabled && (
                <div className="relative shrink-0">
                  <button
                    ref={qualityAnchorRef}
                    type="button"
                    data-lms-quality-trigger
                    onClick={() => {
                      setShowQualityMenu((v) => !v);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2 sm:px-3 py-2 text-sm font-semibold rounded-lg min-w-[2.75rem] sm:min-w-[3.5rem] transition-colors bg-white/15 text-white hover:bg-primary-pink/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50 ${
                      showQualityMenu ? 'bg-primary-pink/30 text-white ring-2 ring-primary-pink/50' : ''
                    }`}
                    aria-label="Video quality"
                    aria-expanded={showQualityMenu}
                    title="Quality"
                  >
                    {qualityButtonLabel}
                  </button>
                  {showQualityMenu &&
                    qualityMenuPos &&
                    createPortal(
                      <div
                        ref={qualityMenuRef}
                        role="menu"
                        data-lms-quality-menu
                        className="fixed z-[9999] py-1.5 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl min-w-[5.5rem] max-h-[240px] overflow-y-auto pointer-events-auto"
                        style={{
                          left: qualityMenuPos.left,
                          bottom: qualityMenuPos.bottom,
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40 pointer-events-none">
                          Quality
                        </p>
                        {qualityOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selectedQualityId === option.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQualitySelect(option);
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                              selectedQualityId === option.id
                                ? 'text-primary-pink font-semibold bg-primary-pink/10'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                </div>
              )}

              <div className="relative shrink-0">
                <button
                  ref={speedAnchorRef}
                  type="button"
                  data-lms-speed-trigger
                  onClick={() => {
                    setShowSpeedMenu((v) => !v);
                    setShowQualityMenu(false);
                  }}
                  className={`px-2 sm:px-3 py-2 text-sm font-semibold rounded-lg min-w-[2.75rem] sm:min-w-[3.25rem] transition-colors bg-white/15 text-white hover:bg-primary-pink/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50 ${
                    showSpeedMenu ? 'bg-primary-pink/30 text-white ring-2 ring-primary-pink/50' : ''
                  }`}
                  aria-label="Playback speed"
                  aria-expanded={showSpeedMenu}
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu &&
                  speedMenuPos &&
                  createPortal(
                    <div
                      ref={speedMenuRef}
                      role="menu"
                      data-lms-speed-menu
                      className="fixed z-[9999] py-1.5 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl min-w-[4.5rem] overflow-hidden pointer-events-auto"
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        left: speedMenuPos.left,
                        bottom: speedMenuPos.bottom,
                      }}
                    >
                      {PLAYBACK_RATES.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          role="menuitemradio"
                          aria-checked={playbackRate === rate}
                          onClick={() => setRate(rate)}
                          className={`block w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                            playbackRate === rate
                              ? 'text-primary-pink font-semibold bg-primary-pink/10'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>,
                    document.body
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
