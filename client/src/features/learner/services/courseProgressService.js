import apiClient from '@/api/apiClient';

/**
 * GET /api/learner/course-progress/:courseId
 * @param {string} courseId
 * @returns {Promise<{ chapterProgress: Array<{ chapterId, currentTime, duration, watchedPercentage, completed }>, overallPercentage: number, completed: boolean }>}
 */
export async function getCourseProgress(courseId) {
  const res = await apiClient.get(`/learner/course-progress/${courseId}`);
  const data = res?.data?.data ?? res?.data;
  return {
    chapterProgress: data?.chapterProgress ?? [],
    overallPercentage: data?.overallPercentage ?? 0,
    completed: !!data?.completed,
  };
}

/**
 * PATCH /api/learner/course-progress
 * @param {{ courseId: string, chapterId: string, currentTime: number, duration: number, watchedPercentage: number, completed?: boolean }} payload
 */
export async function updateCourseProgress(payload) {
  const res = await apiClient.patch('/learner/course-progress', payload);
  return res?.data?.data ?? res?.data;
}

/**
 * Fire-and-forget progress save for tab close / hide (fetch keepalive).
 * @param {{ courseId: string, chapterId: string, currentTime: number, duration: number, watchedPercentage: number }} payload
 */
export function flushCourseProgressKeepalive(payload) {
  const baseURL = apiClient.defaults.baseURL || '';
  const url = `${baseURL.replace(/\/+$/, '')}/learner/course-progress`;
  const body = {
    courseId: payload.courseId,
    chapterId: payload.chapterId,
    currentTime: payload.currentTime ?? 0,
    duration: payload.duration ?? 0,
    watchedPercentage: payload.watchedPercentage ?? 0,
  };
  try {
    fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
      keepalive: true,
    });
  } catch (_) {
    /* best-effort on unload */
  }
}
