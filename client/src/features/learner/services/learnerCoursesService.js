import apiClient from '@/api/apiClient';

/**
 * GET /api/learner/courses
 * Returns the current user's enrolled courses with progress.
 */
export async function getMyEnrolledCourses() {
  const res = await apiClient.get('/learner/courses');
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/learner/courses/live-sessions
 * Scheduled live sessions (with meeting URLs) for enrolled courses only.
 * @param {import('axios').AxiosRequestConfig} [axiosConfig] Optional axios config (e.g. { signal } for AbortController).
 */
export async function getMyLiveSessions(axiosConfig = {}) {
  // Do not set Cache-Control/Pragma on the request: they trigger a CORS preflight and
  // must be listed in Access-Control-Allow-Headers. Cache busting uses _t; the API
  // responds with Cache-Control: no-store.
  const res = await apiClient.get('/learner/courses/live-sessions', {
    ...axiosConfig,
    params: { ...(axiosConfig.params || {}), _t: Date.now() },
  });
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
}

/**
 * GET /api/learner/courses/check/:courseId
 * Returns whether the current user is enrolled in the course. Requires auth.
 * @param {string} courseId
 * @returns {{ enrolled: boolean }}
 */
export async function checkEnrollment(courseId) {
  const res = await apiClient.get(`/learner/courses/check/${courseId}`);
  const data = res?.data ?? res;
  return { enrolled: !!data?.enrolled };
}

/**
 * POST /api/learner/courses/enroll
 * Enrolls the current user in a course (free or after payment).
 * @param {string} courseId
 */
export async function enrollInCourse(courseId) {
  const res = await apiClient.post('/learner/courses/enroll', { courseId });
  return res?.data ?? res;
}
