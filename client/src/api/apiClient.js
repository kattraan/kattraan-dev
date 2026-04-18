import axios from 'axios';
import { clearSessionAndRedirectToLogin } from '@/utils/authHelpers';
import { attachApiMessage } from '@/utils/apiErrorMessages';

/** Ensures base URL matches server mounts (`/api/auth`, `/api/...`). Host-only values get `/api` appended. */
function normalizeApiBaseUrl(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    const trimmed = raw.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/api')) return trimmed;
    return `${trimmed}/api`;
}

const isProduction = import.meta.env.MODE === 'production';
const apiUrl = import.meta.env.VITE_API_URL;

if (isProduction && (apiUrl === undefined || apiUrl === '')) {
    throw new Error(
        'VITE_API_URL is required in production. Set it in your environment or .env file.'
    );
}

const baseURL = apiUrl ? normalizeApiBaseUrl(apiUrl) : 'http://localhost:5000/api';

/**
 * Production-ready Axios instance with:
 * 1. Base URL configuration
 * 2. Request interception (to add Auth tokens)
 * 3. Response interception (to handle common errors globally)
 */
const apiClient = axios.create({
    baseURL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: for FormData, drop Content-Type so browser sets multipart/form-data with boundary
apiClient.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            const headers = { ...config.headers };
            delete headers['Content-Type'];
            config.headers = headers;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle global errors and Token Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // SKIP refresh logic for login or refresh requests themselves to avoid infinite loops
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint to get new cookies
                await apiClient.post('/auth/refresh');

                // If successful, retry the queued requests
                processQueue(null);
                isRefreshing = false;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;
                attachApiMessage(err);
                clearSessionAndRedirectToLogin();
                return Promise.reject(err);
            }
        }

        // Attach user-friendly message for toasts (no technical details)
        attachApiMessage(error);
        return Promise.reject(error);
    }
);

export default apiClient;
