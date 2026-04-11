import { useState, useEffect, useRef, useCallback } from 'react';
import { getCourseProgress, updateCourseProgress } from '@/features/learner/services/courseProgressService';

const SYNC_INTERVAL_MS = 10000;

function toChapterKey(id) {
  if (id == null) return '';
  return String(id);
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastSyncRef = useRef(0);

  const saveProgress = useCallback(
    async (payload) => {
      if (!courseId || !payload.chapterId) return;
      try {
        const data = await updateCourseProgress({
          courseId,
          chapterId: payload.chapterId,
          currentTime: payload.currentTime ?? 0,
          duration: payload.duration ?? 0,
          watchedPercentage: payload.watchedPercentage ?? 0,
        });
        const k = toChapterKey(data?.chapterId ?? payload.chapterId);
        if (k && data && typeof data === 'object') {
          setProgressByChapter((prev) => ({
            ...prev,
            [k]: {
              ...prev[k],
              chapterId: data.chapterId,
              currentTime: data.currentTime,
              duration: data.duration,
              watchedPercentage: data.watchedPercentage,
              completed: !!data.completed,
            },
          }));
        }
      } catch (err) {
        setError(err);
      }
    },
    [courseId],
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
      setIsCompleted(false);
      return;
    }
    const chapterProgressEntry = progressByChapter[key];
    if (chapterProgressEntry) {
      setInitialTime(chapterProgressEntry.currentTime ?? 0);
      setIsCompleted(!!chapterProgressEntry.completed);
    } else {
      setInitialTime(0);
      setIsCompleted(false);
    }
  }, [chapterId, progressByChapter]);

  useEffect(() => {
    if (!courseId || !chapterId || duration <= 0) return;
    const watchedPercentage = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    if (isPlaying && Date.now() - lastSyncRef.current >= SYNC_INTERVAL_MS) {
      lastSyncRef.current = Date.now();
      saveProgress({ chapterId, currentTime, duration, watchedPercentage });
    }
  }, [courseId, chapterId, currentTime, duration, isPlaying, saveProgress]);

  return {
    initialTime,
    isCompleted,
    progressByChapter,
    overallPercentage,
    error,
    isLoading,
    saveProgress,
  };
}
