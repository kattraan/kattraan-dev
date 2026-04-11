import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { formatTime, PLAYBACK_RATES } from '@/utils/videoUtils';

export default function VideoPlayer({ activeChapter, posterUrl, autoPlay = true, className = '' }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const videoContent = activeChapter?.contents?.find((c) => c.type === 'video');
  const videoUrl = videoContent?.videoUrl;
  const title = activeChapter?.title || 'Lesson video';

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    const video = videoRef.current;
    if (video && autoPlay) {
      video.play().catch(() => {});
    }
  }, [autoPlay]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
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

  const setRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  // When source changes (new chapter), show loading and reset time
  useEffect(() => {
    if (!videoUrl) return;
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  }, [videoUrl]);

  // Attach event listeners to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleCanPlay, handleLoadStart, handlePlay, handlePause, handleSeeked]);

  if (!videoUrl) {
    return (
      <div className={`aspect-video w-full bg-[#121212] flex flex-col items-center justify-center ${className}`}>
        <p className="text-white/40 text-sm">No video for this lesson</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-black overflow-hidden rounded-none ${className}`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        title={title}
        className="w-full h-full object-contain"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <Loader2 size={48} className="text-white animate-spin" aria-hidden />
        </div>
      )}

      {/* Control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-2 px-3 z-10">
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute top-0 left-0 right-0 w-full h-1 appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-pink [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Seek"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <span className="text-xs font-medium text-white/90 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMute}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 appearance-none bg-white/20 rounded [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <div className="relative ml-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowSpeedMenu((v) => !v)}
              className="px-3 py-2 text-sm font-semibold rounded-lg min-w-[3.25rem] bg-white/15 text-white hover:bg-primary-pink/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-pink/50"
              aria-label="Playback speed"
            >
              {playbackRate}x
            </button>
            {showSpeedMenu && (
              <>
                <div className="fixed inset-0 z-20" aria-hidden onClick={() => setShowSpeedMenu(false)} />
                <div className="absolute bottom-full left-0 mb-1 py-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-30 min-w-[4rem]">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setRate(rate)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${playbackRate === rate ? 'text-primary-pink font-semibold' : ''}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
