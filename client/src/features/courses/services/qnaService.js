import apiClient from '@/api/apiClient';

const qnaService = {
  /**
   * Fetch questions for a course, optionally filtered by chapter.
   */
  getQuestions: async ({ courseId, chapterId }) => {
    const params = new URLSearchParams();
    if (courseId) params.append('course', courseId);
    if (chapterId) params.append('chapter', chapterId);
    const response = await apiClient.get(`/qna?${params.toString()}`);
    return response.data;
  },

  /**
   * Create a new QnA question.
   */
  createQuestion: async ({ courseId, chapterId, title, description }) => {
    const response = await apiClient.post('/qna', {
      course: courseId,
      chapter: chapterId,
      title,
      description,
    });
    return response.data;
  },

  /**
   * Add a reply to a question. Returns updated question with replies populated.
   */
  addReply: async (questionId, body) => {
    const response = await apiClient.post(`/qna/${questionId}/replies`, { body });
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await apiClient.delete(`/qna/${questionId}`);
    return response.data;
  },

  deleteReply: async (questionId, replyId) => {
    const response = await apiClient.delete(`/qna/${questionId}/replies/${replyId}`);
    return response.data;
  },
};

export default qnaService;

