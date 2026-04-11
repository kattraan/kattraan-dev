import apiClient from '@/api/apiClient';

/**
 * Authentication Service Layer
 * Encapsulates all auth-related API calls
 */
const authService = {
    login: async (email, password) => {
        // Map frontend "email" to backend "userEmail"
        const response = await apiClient.post('/auth/login', { userEmail: email, password });
        // Token is set as HTTP-only cookie
        return response.data;
    },

    register: async (userData) => {
        // Map frontend data { name, email, password } to backend { userName, userEmail, password }
        const payload = {
            userName: userData.name,
            userEmail: userData.email,
            password: userData.password,
            roles: userData.roles || [1] // Default to learner [1] if not provided
        };
        const response = await apiClient.post('/auth/register', payload);
        return response.data;
    },

    logout: async () => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Cleanup any legacy token; auth is cookie-based
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    submitEnrollment: async (data) => {
        const response = await apiClient.post('/auth/submit-enrollment', data);
        // Update local storage user if needed, but slice will handle state
        return response.data;
    },

    approveInstructor: async (userId, action) => {
        const response = await apiClient.post('/auth/admin-approve', { userId, action });
        return response.data;
    },

    becomeInstructor: async (email) => {
        const response = await apiClient.post('/auth/become-instructor', { userEmail: email });
        // We might want to update local storage user here if the backend returns the updated user
        if (response.data.success && response.data.user) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                // Merge updates
                const updatedUser = { ...currentUser, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        return response.data;
    },

    becomeLearner: async () => {
        const response = await apiClient.post('/auth/become-learner');
        if (response.data.success && response.data.user) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const currentUser = JSON.parse(userStr);
                const updatedUser = { ...currentUser, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        return response.data;
    },

    checkAuth: async () => {
        const response = await apiClient.get('/auth/check-auth');
        return response.data;
    },

    updateProfile: async (userId, payload) => {
        const response = await apiClient.put(`/users/${userId}`, payload);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/forgot-password', { userEmail: email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    googleOneTapLogin: async (idToken) => {
        const response = await apiClient.post('/auth/google/one-tap', { id_token: idToken });
        return response.data;
    }
};

export default authService;
