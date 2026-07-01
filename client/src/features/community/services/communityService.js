import apiClient from '@/api/apiClient';

const communityService = {
    getCommunities: async () => {
        const response = await apiClient.get('/community');
        return response.data;
    },

    getCommunity: async (id) => {
        const response = await apiClient.get(`/community/${id}`);
        return response.data;
    },

    createCommunity: async ({ course, name, description }) => {
        const response = await apiClient.post('/community', { course, name, description });
        return response.data;
    },

    updateCommunity: async (id, payload) => {
        const response = await apiClient.patch(`/community/${id}`, payload);
        return response.data;
    },

    archiveCommunity: async (id) => {
        const response = await apiClient.delete(`/community/${id}`);
        return response.data;
    },

    requestJoin: async (id) => {
        const response = await apiClient.post(`/community/${id}/join`);
        return response.data;
    },

    leaveCommunity: async (id) => {
        const response = await apiClient.post(`/community/${id}/leave`);
        return response.data;
    },

    getJoinRequests: async (id) => {
        const response = await apiClient.get(`/community/${id}/requests`);
        return response.data;
    },

    decideJoinRequest: async (id, userId, action) => {
        const response = await apiClient.patch(`/community/${id}/requests/${userId}`, { action });
        return response.data;
    },

    getMembers: async (id) => {
        const response = await apiClient.get(`/community/${id}/members`);
        return response.data;
    },

    removeMember: async (id, userId) => {
        const response = await apiClient.delete(`/community/${id}/members/${userId}`);
        return response.data;
    },

    getMessages: async (id, before) => {
        const response = await apiClient.get(`/community/${id}/messages`, {
            params: before ? { before } : undefined,
        });
        return response.data;
    },

    searchMessages: async (id, q) => {
        const response = await apiClient.get(`/community/${id}/messages/search`, { params: { q } });
        return response.data;
    },

    getPinnedMessages: async (id) => {
        const response = await apiClient.get(`/community/${id}/messages/pinned`);
        return response.data;
    },

    uploadAttachment: async (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/community/${id}/attachments`, formData);
        return response.data;
    },
};

export default communityService;
