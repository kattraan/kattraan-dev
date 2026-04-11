import apiClient from '@/api/apiClient';

const chapterCommentService = {
  getComments: async ({ courseId, chapterId, status }) => {
    const params = new URLSearchParams();
    if (courseId) params.append('course', courseId);
    if (chapterId) params.append('chapter', chapterId);
    if (status === 'read' || status === 'unread') params.append('status', status);
    const response = await apiClient.get(`/chapter-comments?${params.toString()}`);
    return response.data;
  },

  createComment: async ({ courseId, chapterId, text }) => {
    const response = await apiClient.post('/chapter-comments', {
      course: courseId,
      chapter: chapterId,
      text: text.trim(),
    });
    return response.data;
  },

  addReply: async (commentId, text) => {
    const response = await apiClient.post(`/chapter-comments/${commentId}/replies`, { text: text.trim() });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await apiClient.delete(`/chapter-comments/${commentId}`);
    return response.data;
  },

  deleteReply: async (commentId, replyId) => {
    const response = await apiClient.delete(`/chapter-comments/${commentId}/replies/${replyId}`);
    return response.data;
  },

  updateComment: async (commentId, payload) => {
    const response = await apiClient.patch(`/chapter-comments/${commentId}`, payload);
    return response.data;
  },
};

export default chapterCommentService;
