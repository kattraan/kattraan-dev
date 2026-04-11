import apiClient from '@/api/apiClient';

/**
 * Admin API layer.
 * All admin-only API calls (user/instructor management) go through here.
 */
const adminService = {
  /**
   * Fetch users with status=pending_approval (instructor applications).
   * @returns {Promise<{ success: boolean, data: Array }>} response.data from API
   * @throws on network or 4xx/5xx (caller should catch and handle)
   */
  getPendingInstructorApplications: async () => {
    const response = await apiClient.get('/users?status=pending_approval');
    return response.data;
  },

  /** Courses pending admin approval */
  getPendingCourses: async () => {
    const response = await apiClient.get('/admin/courses/pending');
    return response.data;
  },
  /** Full course details for admin review (sections, chapters, contents populated) */
  getCourseForReview: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },
  approveCourse: async (courseId) => {
    const response = await apiClient.patch(`/admin/courses/${courseId}/approve`);
    return response.data;
  },
  rejectCourse: async (courseId, rejectionReason) => {
    const response = await apiClient.patch(`/admin/courses/${courseId}/reject`, { rejectionReason });
    return response.data;
  },
};

export default adminService;
