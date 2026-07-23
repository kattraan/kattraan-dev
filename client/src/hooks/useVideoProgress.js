import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getCourseProgress,
  updateCourseProgress,
  flushCourseProgressKeepalive,
} from '@/features/learner/services/courseProgressService';

const SYNC_INTERVAL_MS = 5000;
/** Skip redundant PATCHes when playback position barely moved. */
const MIN_DELTA_SEC = 3;
/** Lower bar for pause / chapter switch / tab hide so resume stays accurate. */
const FLUSH_MIN_DELTA_SEC = 1;

function toChapterKey(id) {
  if (id == null) return '';
  return String(id);
}

function buildWatchedPercentage(currentTime, duration) {
  return duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
}

/**
 * Fetches course progress once per course and provides saveProgress for watch-time tracking.
 * Chapter switches only update resume position from the in-memory map (no refetch per lesson).
 *
 * @param {string} courseId
 * @param {string} chapterId
 * @param {{ currentTime: number, duration: number }} playback
 * @param {boolean} isPlaying
 * @param {{ courseProgressSnapshot?: { chapterProgress: array, overallPercentage: number, forCourseId: string } | null, waitForSnapshot?: boolean }} [options]
 */
export function useVideoProgress(courseId, chapterId, playback, isPlaying, options = {}) {
  const { courseProgressSnapshot = null, waitForSnapshot = false } = options;
  const { currentTime = 0, duration = 0 } = playback || {};
  const [progressByChapter, setProgressByChapter] = useState({});
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const lastSyncRef = useRef(0);
  const lastSavedTimeRef = useRef(0);
  const lastSavedChapterRef = useRef('');
  const wasPlayingRef = useRef(isPlaying);
  const playbackRef = useRef({ courseId, chapterId, currentTime, duration });

  useEffect(() => {
    playbackRef.current = { courseId, chapterId, currentTime, duration };
  }, [courseId, chapterId, currentTime, duration]);

  const applyServerChapterEntry = useCallback((data, payloadChapterId) => {
    const k = toChapterKey(data?.chapterId ?? payloadChapterId);
    if (!k || !data || typeof data !== 'object') return;
    setProgressByChapter((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        chapterId: data.chapterId,
        currentTime: data.currentTime,
        maxWatchedTime: data.maxWatchedTime ?? data.currentTime ?? 0,
        duration: data.duration,
        watchedPercentage: data.watchedPercentage,
        completed: !!data.completed,
      },
    }));
    if (toChapterKey(payloadChapterId) === k) {
      setMaxWatchedTime(data.maxWatchedTime ?? data.currentTime ?? 0);
    }
  }, []);

  const shouldPersist = useCallback((chId, time, dur, { force = false, minDelta = MIN_DELTA_SEC } = {}) => {
    if (!courseId || !chId || dur <= 0) return false;
    if (force) return true;
    const key = toChapterKey(chId);
    if (key !== lastSavedChapterRef.current) return true;
    return Math.abs(time - lastSavedTimeRef.current) >= minDelta;
  }, [courseId]);

  const markPersisted = useCallback((chId, time) => {
    lastSyncRef.current = Date.now();
    lastSavedTimeRef.current = time;
    lastSavedChapterRef.current = toChapterKey(chId);
  }, []);

  const saveProgress = useCallback(
    async (payload) => {
      if (!courseId || !payload.chapterId) return;
      const dur = payload.duration ?? 0;
      const time = payload.currentTime ?? 0;
      if (!shouldPersist(payload.chapterId, time, dur, { force: !!payload.force })) return;

      try {
        const data = await updateCourseProgress({
          courseId,
          chapterId: payload.chapterId,
          currentTime: time,
          duration: dur,
          watchedPercentage: payload.watchedPercentage ?? buildWatchedPercentage(time, dur),
        });
        markPersisted(payload.chapterId, time);
        applyServerChapterEntry(data, payload.chapterId);
      } catch (err) {
        setError(err);
      }
    },
    [courseId, shouldPersist, markPersisted, applyServerChapterEntry],
  );

  const flushProgress = useCallback(
    (override = {}, { keepalive = false, force = false, minDelta = FLUSH_MIN_DELTA_SEC } = {}) => {
      const snap = { ...playbackRef.current, ...override };
      const chId = snap.chapterId;
      const time = snap.currentTime ?? 0;
      const dur = snap.duration ?? 0;
      const cId = snap.courseId || courseId;
      if (!shouldPersist(chId, time, dur, { force, minDelta })) return;

      const watchedPercentage = buildWatchedPercentage(time, dur);
      const apiPayload = {
        courseId: cId,
        chapterId: chId,
        currentTime: time,
        duration: dur,
        watchedPercentage,
      };

      markPersisted(chId, time);

      if (keepalive) {
        flushCourseProgressKeepalive(apiPayload);
        return;
      }

      updateCourseProgress(apiPayload)
        .then((data) => applyServerChapterEntry(data, chId))
        .catch((err) => setError(err));
    },
    [courseId, shouldPersist, markPersisted, applyServerChapterEntry],
  );

  const applyProgressPayload = useCallback((chapterProgress, overall) => {
    const byChapter = {};
    (chapterProgress || []).forEach((c) => {
      const k = toChapterKey(c.chapterId);
      if (k) byChapter[k] = c;
    });
    setProgressByChapter(byChapter);
    setOverallPercentage(overall ?? 0);
  }, []);

  // Load progress once per course (or hydrate from snapshot from parallel page load).
  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return undefined;
    }

    if (waitForSnapshot && (!courseProgressSnapshot || courseProgressSnapshot.forCourseId !== courseId)) {
      setIsLoading(true);
      return undefined;
    }

    let cancelled = false;
    setError(null);

    if (courseProgressSnapshot?.forCourseId === courseId) {
      applyProgressPayload(
        courseProgressSnapshot.chapterProgress,
        courseProgressSnapshot.overallPercentage,
      );
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    (async () => {
      try {
        const { chapterProgress, overallPercentage: overall } = await getCourseProgress(courseId);
        if (cancelled) return;
        applyProgressPayload(chapterProgress, overall);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId, courseProgressSnapshot, waitForSnapshot, applyProgressPayload]);

  // When user changes lesson, resume time comes from the map (no extra GET).
  useEffect(() => {
    const key = toChapterKey(chapterId);
    if (!key) {
      setInitialTime(0);
      setMaxWatchedTime(0);
      setIsCompleted(false);
      return;
    }
    const chapterProgressEntry = progressByChapter[key];
    if (chapterProgressEntry) {
      setInitialTime(chapterProgressEntry.currentTime ?? 0);
      setMaxWatchedTime(
        chapterProgressEntry.maxWatchedTime ?? chapterProgressEntry.currentTime ?? 0,
      );
      setIsCompleted(!!chapterProgressEntry.completed);
      lastSavedTimeRef.current = chapterProgressEntry.currentTime ?? 0;
      lastSavedChapterRef.current = key;
    } else {
      setInitialTime(0);
      setMaxWatchedTime(0);
      setIsCompleted(false);
      lastSavedTimeRef.current = 0;
      lastSavedChapterRef.current = key;
    }
  }, [chapterId, progressByChapter]);

  // Flush previous chapter when switching lessons or leaving the page.
  useEffect(() => {
    return () => {
      flushProgress({}, { keepalive: true, minDelta: FLUSH_MIN_DELTA_SEC });
    };
  }, [chapterId, flushProgress]);

  // Save on pause.
  useEffect(() => {
    const wasPlaying = wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;
    if (wasPlaying && !isPlaying) {
      flushProgress();
    }
  }, [isPlaying, flushProgress]);

  // Periodic sync while playing (every 5s, skip tiny deltas).
  useEffect(() => {
    if (!courseId || !chapterId || duration <= 0 || !isPlaying) return;
    if (Date.now() - lastSyncRef.current < SYNC_INTERVAL_MS) return;
    if (!shouldPersist(chapterId, currentTime, duration)) return;

    saveProgress({
      chapterId,
      currentTime,
      duration,
      watchedPercentage: buildWatchedPercentage(currentTime, duration),
    });
  }, [courseId, chapterId, currentTime, duration, isPlaying, saveProgress, shouldPersist]);

  // Save when tab is hidden or the page is closing.
  useEffect(() => {
    if (!courseId) return undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress({}, { keepalive: true, minDelta: FLUSH_MIN_DELTA_SEC });
      }
    };

    const onBeforeUnload = () => {
      flushProgress({}, { keepalive: true, minDelta: FLUSH_MIN_DELTA_SEC });
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [courseId, flushProgress]);

  return {
    initialTime,
    maxWatchedTime,
    isCompleted,
    progressByChapter,
    overallPercentage,
    error,
    isLoading,
    saveProgress,
  };
}
