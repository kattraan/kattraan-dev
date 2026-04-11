import apiClient from '@/api/apiClient';

/**
 * @typedef {object} CourseReviewsPage
 * @property {Array<{ id: string, rating: number, comment: string, tags?: string[], pinned?: boolean, instructorReply?: {message: string, instructorName?: string, createdAt?: string, updatedAt?: string} | null, createdAt: string, authorName: string }>} reviews
 * @property {number} averageRating
 * @property {number} totalCount
 * @property {Array<{ stars: number, count: number, percent: number }>} breakdown
 * @property {{ positivePercent: number, neutralPercent: number, negativePercent: number }} [sentiment]
 * @property {Array<{ tag: string, count: number }>} [topTags]
 * @property {Array<{ month: string, count: number, averageRating: number }>} [trend]
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

/**
 * GET /courses/:courseId/reviews — public.
 * @param {string} courseId
 * @param {{ page?: number, limit?: number }} [opts]
 * @returns {Promise<CourseReviewsPage>}
 */
export async function fetchCourseReviews(courseId, opts = {}) {
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 10;
  const { data } = await apiClient.get(`/courses/${courseId}/reviews`, { params: { page, limit } });
  const payload = data?.data ?? data;
  if (!payload) return null;
  return payload;
}

/**
 * GET /courses/:courseId/reviews/mine — auth.
 * @returns {Promise<{ id: string, rating: number, comment: string, createdAt: string } | null>}
 */
export async function fetchMyCourseReview(courseId) {
  const { data } = await apiClient.get(`/courses/${courseId}/reviews/mine`);
  return data?.data ?? null;
}

export async function submitCourseReview(courseId, { rating, comment, tags }) {
  const { data } = await apiClient.post(`/courses/${courseId}/reviews`, { rating, comment, tags });
  return data?.data ?? data;
}

export async function updateMyCourseReview(courseId, { rating, comment, tags }) {
  const body = {};
  if (rating !== undefined) body.rating = rating;
  if (comment !== undefined) body.comment = comment;
  if (tags !== undefined) body.tags = tags;
  const { data } = await apiClient.patch(`/courses/${courseId}/reviews/mine`, body);
  return data?.data ?? data;
}

/**
 * PATCH /courses/:courseId/reviews/:reviewId/meta — instructor owner reply/pin.
 */
export async function updateInstructorReviewMeta(courseId, reviewId, payload) {
  const { data } = await apiClient.patch(`/courses/${courseId}/reviews/${reviewId}/meta`, payload);
  return data?.data ?? data;
}

/** DELETE /courses/:courseId/reviews/mine — auth */
export async function deleteMyCourseReview(courseId) {
  const { data } = await apiClient.delete(`/courses/${courseId}/reviews/mine`);
  return data;
}
