import apiClient from '@/api/apiClient';

/**
 * GET /api/learner/streak
 * @returns {Promise<{ currentStreak: number, longestStreak: number, lastActivityDate: string|null, activeToday: boolean }>}
 */
export async function getLearningStreak() {
  const res = await apiClient.get('/learner/streak');
  const data = res?.data?.data ?? res?.data;
  return {
    currentStreak: Number(data?.currentStreak) || 0,
    longestStreak: Number(data?.longestStreak) || 0,
    lastActivityDate: data?.lastActivityDate ?? null,
    activeToday: !!data?.activeToday,
  };
}
