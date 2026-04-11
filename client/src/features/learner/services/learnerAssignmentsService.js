import apiClient from '@/api/apiClient';

/**
 * GET /api/learner/assignments
 * Graded assignments only (not lesson quizzes).
 */
export async function getMyAssignments() {
  const res = await apiClient.get('/learner/assignments');
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
}

/**
 * POST /api/learner/assignments/:contentId/submit
 * @param {string} contentId
 * @param {{ submissionText?: string, submissionFileUrl?: string }} payload
 */
export async function submitAssignment(contentId, payload) {
  const res = await apiClient.post(`/learner/assignments/${contentId}/submit`, payload);
  return res?.data?.data ?? res?.data;
}

/** Loads saved submission for any enrolled quiz content (lesson quiz or graded assignment). */
export async function getAssignmentRowByContentId(contentId) {
  if (!contentId) return null;
  try {
    const res = await apiClient.get(
      `/learner/assignments/by-content/${contentId}`,
    );
    return res?.data?.data ?? null;
  } catch (e) {
    const status = e?.response?.status;
    if (status === 403 || status === 404) {
      return { submission: null };
    }
    throw e;
  }
}
