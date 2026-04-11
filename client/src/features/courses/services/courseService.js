import apiClient from '@/api/apiClient';

const courseService = {
    // Fetch published courses for public listing (navbar "Courses" – admin-approved only)
    getPublicCourses: async () => {
        const response = await apiClient.get('/courses/public');
        return response.data;
    },

    // Fetch courses for the current instructor
    getInstructorCourses: async () => {
        const response = await apiClient.get('/courses/instructor');
        return response.data;
    },

    // Get single course details (full populate – used by instructor editor)
    getCourseById: async (id) => {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
    },

    // Slim course for learner watch-page sidebar (sections + chapter titles, no contents)
    getCourseOverview: async (id) => {
        const response = await apiClient.get(`/courses/${id}/overview`);
        return response.data;
    },

    // Full chapter with contents populated and video URLs signed
    getChapterContent: async (chapterId) => {
        const response = await apiClient.get(`/chapters/${chapterId}/content`);
        return response.data;
    },

    // Refresh a signed Bunny CDN play URL for a chapter's video (legacy)
    getVideoPlayUrl: async (chapterId) => {
        const response = await apiClient.get(`/chapters/${chapterId}/play`);
        return response.data;
    },

    /**
     * Secure video access: get a temporary signed playback URL by video content ID.
     * Use this instead of any direct videoUrl from the API.
     */
    getVideoPlayUrlByVideoId: async (videoId) => {
        const response = await apiClient.get(`/videos/${videoId}/play`);
        return response.data;
    },

    // Create a new course
    createCourse: async (courseData) => {
        const response = await apiClient.post('/courses', courseData);
        return response.data;
    },

    // Update an existing course
    updateCourse: async (id, courseData) => {
        const response = await apiClient.put(`/courses/${id}`, courseData);
        return response.data;
    },

    /**
     * Replace live session rows (Meet/Zoom URL + schedule). Instructor only.
     * @param {string} id course id
     * @param {Array<{ title?: string, meetingUrl: string, scheduledAt: string, scheduledEnd: string, _id?: string }>} sessions
     */
    updateCourseLiveSessions: async (id, sessions) => {
        const response = await apiClient.put(`/courses/${id}/live-sessions`, { sessions });
        return response.data;
    },

    // Delete a course
    deleteCourse: async (id) => {
        const response = await apiClient.delete(`/courses/${id}`);
        return response.data;
    },

    // --- Section Management ---
    createSection: async (sectionData) => {
        const response = await apiClient.post('/sections', sectionData);
        return response.data;
    },
    updateSection: async (id, sectionData) => {
        const response = await apiClient.put(`/sections/${id}`, sectionData);
        return response.data;
    },
    deleteSection: async (id) => {
        const response = await apiClient.delete(`/sections/${id}`);
        return response.data;
    },

    // --- Chapter Management ---
    createChapter: async (chapterData) => {
        const response = await apiClient.post('/chapters', chapterData);
        return response.data;
    },
    updateChapter: async (id, chapterData) => {
        const response = await apiClient.put(`/chapters/${id}`, chapterData);
        return response.data;
    },
    deleteChapter: async (id) => {
        const response = await apiClient.delete(`/chapters/${id}`);
        return response.data;
    },

    // --- Content Management ---
    uploadMedia: async (file, courseId) => {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid file is required for upload');
        }
        if (!courseId) {
            throw new Error('courseId is required for media upload');
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', String(courseId));
        const response = await apiClient.post('/media/upload', formData, {
            withCredentials: true,
        });
        return response.data;
    },

    /**
     * Upload media with progress callback for UX (progress bar).
     * @param {File} file
     * @param {string} courseId
     * @param { (percent: number) => void } onProgress - 0-100
     * @returns {Promise<{ success: boolean, data?: { url, key, id } }>}
     */
    uploadMediaWithProgress: async (file, courseId, onProgress) => {
        if (!file || !(file instanceof File)) {
            throw new Error('A valid file is required for upload');
        }
        if (!courseId) {
            throw new Error('courseId is required for media upload');
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', String(courseId));
        const response = await apiClient.post('/media/upload', formData, {
            withCredentials: true,
            onUploadProgress: (e) => {
                if (e.total && typeof onProgress === 'function') {
                    const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
                    onProgress(percent);
                }
            },
        });
        return response.data;
    },

    /**
     * Optional: poll video processing status when backend supports it.
     * @param {string} videoId - content or media id
     * @returns {Promise<{ status: 'processing' | 'ready' }>}
     */
    getVideoStatus: async (videoId) => {
        const response = await apiClient.get(`/video/${videoId}/status`);
        return response.data;
    },
    // Video upload: use videoUploadService.uploadVideoDirect (direct TUS to Bunny). No server-side file upload.

    createContent: async (type, data) => {
        // Map types to their specific endpoints
        const endpointMap = {
            video: '/videocontents',
            quiz: '/quizcontents',
            resource: '/resourcecontents',
            article: '/articlecontents',
            audio: '/audiocontents',
            image: '/imagecontents'
        };
        const endpoint = endpointMap[type] || '/contents';
        const response = await apiClient.post(endpoint, data);
        return response.data;
    },

    updateContent: async (type, id, data) => {
        // Map types to their specific endpoints
        const endpointMap = {
            video: '/videocontents',
            quiz: '/quizcontents',
            resource: '/resourcecontents',
            article: '/articlecontents',
            audio: '/audiocontents',
            image: '/imagecontents'
        };
        const endpoint = endpointMap[type] || '/contents';
        const response = await apiClient.put(`${endpoint}/${id}`, data);
        return response.data;
    },

    deleteContent: async (type, id) => {
        const endpointMap = {
            video: '/videocontents',
            quiz: '/quizcontents',
            resource: '/resourcecontents',
            article: '/articlecontents',
            audio: '/audiocontents',
            image: '/imagecontents'
        };
        const endpoint = endpointMap[type] || '/contents';
        const response = await apiClient.delete(`${endpoint}/${id}`);
        return response.data;
    },

    // Clone a course
    cloneCourse: async (id) => {
        const response = await apiClient.post(`/courses/clone/${id}`);
        return response.data;
    },

    // Submit course for admin review (draft/rejected → pending_approval)
    submitForReview: async (id) => {
        const response = await apiClient.patch(`/courses/${id}/submit-for-review`);
        return response.data;
    },

    // --- Assignment submissions (instructor) ---
    getCourseAssignments: async (courseId) => {
        const response = await apiClient.get(`/courses/${courseId}/assignments`);
        const data = response?.data?.data ?? response?.data;
        return Array.isArray(data) ? data : [];
    },
    getAssignmentSubmissions: async (courseId, contentId) => {
        const response = await apiClient.get(`/courses/${courseId}/assignments/${contentId}/submissions`);
        return response?.data ?? response;
    },
    gradeSubmission: async (courseId, submissionId, payload) => {
        const response = await apiClient.patch(`/courses/${courseId}/submissions/${submissionId}`, payload);
        return response?.data?.data ?? response?.data;
    },
};

export default courseService;
