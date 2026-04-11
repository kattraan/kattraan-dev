import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import courseService from '@/features/courses/services/courseService';

/**
 * Minimal HLS player for Bunny Stream videos.
 * Fetches signed play URL by video content ID and plays with hls.js.
 * Use for preview or embed when you only have the content _id.
 *
 * @param {string} videoContentId - Video content document _id (from save response)
 * @param {string} [poster] - Poster URL
 * @param {string} [className] - Container class
 */
export function BunnyHLSPlayer({ videoContentId, poster, className = '' }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoContentId) {
      setPlaybackUrl(null);
      setError(null);
      return;
    }
    let cancelled = false;
    courseService
      .getVideoPlayUrlByVideoId(videoContentId)
      .then((res) => {
        const url = res?.playbackUrl ?? res?.data?.playbackUrl;
        if (!cancelled && url) setPlaybackUrl(url);
        if (!cancelled && !url) setError(new Error('No playback URL'));
      })
      .catch((err) => {
        if (!cancelled) setError(err || new Error('Failed to load video'));
      });
    return () => {
      cancelled = true;
    };
  }, [videoContentId]);

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;

    const video = videoRef.current;
    const isHls = playbackUrl.toLowerCase().includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsLoading(false));
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError(new Error('HLS error'));
      });
      hlsRef.current = hls;
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl;
      video.addEventListener('loadedmetadata', () => setIsLoading(false));
      return () => {
        video.removeEventListener('loadedmetadata', () => {});
        video.src = '';
      };
    }

    video.src = playbackUrl;
    video.addEventListener('loadedmetadata', () => setIsLoading(false));
    return () => {
      video.removeEventListener('loadedmetadata', () => {});
      video.src = '';
    };
  }, [playbackUrl]);

  if (error) {
    return (
      <div className={`rounded-xl bg-white/5 p-6 text-center ${className}`}>
        <p className="text-red-400 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-10 h-10 border-2 border-primary-pink border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full max-h-[400px]"
        controls
        playsInline
        poster={poster}
        onError={(e) => setError(e.target?.error || new Error('Playback failed'))}
      />
    </div>
  );
}

export default BunnyHLSPlayer;
