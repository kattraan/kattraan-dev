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

/** One shared refresh so remounts in the same tab don't rotate twice. */
let refreshPromise = null;

const AUTH_REFRESH_LOCK = 'kattraan-auth-refresh';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * After a refresh failure, another tab may already have new cookies.
 * Re-check before forcing login.
 */
export async function recheckAuthAfterRefreshFailure() {
    try {
        const res = await apiClient.get('/auth/check-auth');
        const data = res?.data;
        if (data?.isAuthenticated) {
            return data.data?.user ?? null;
        }
    } catch {
        /* still unauthenticated */
    }
    return null;
}

/**
 * Rotate access cookie. Cross-tab safe via Web Locks:
 * only one tab hits /auth/refresh; others wait, then re-check cookies.
 */
async function performAuthRefresh() {
    // Another tab may have finished refreshing while we waited for the lock.
    const already = await recheckAuthAfterRefreshFailure();
    if (already) return { data: { success: true, isAuthenticated: true } };

    try {
        return await apiClient.post('/auth/refresh');
    } catch (err) {
        // Cookie jar / multi-tab races: brief wait, re-check, one retry.
        await sleep(300);
        const recovered = await recheckAuthAfterRefreshFailure();
        if (recovered) return { data: { success: true, isAuthenticated: true } };
        await sleep(200);
        try {
            return await apiClient.post('/auth/refresh');
        } catch (retryErr) {
            const recoveredAfterRetry = await recheckAuthAfterRefreshFailure();
            if (recoveredAfterRetry) {
                return { data: { success: true, isAuthenticated: true } };
            }
            throw retryErr;
        }
    }
}

async function runRefreshWithCrossTabLock() {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        return navigator.locks.request(AUTH_REFRESH_LOCK, performAuthRefresh);
    }
    return performAuthRefresh();
}

export function refreshAuthSession() {
    if (!refreshPromise) {
        refreshPromise = runRefreshWithCrossTabLock().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

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

        // SKIP refresh logic for login, refresh, or check-auth to avoid infinite loops / pointless retries
        if (
          originalRequest.url.includes('/auth/login') ||
          originalRequest.url.includes('/auth/refresh') ||
          originalRequest.url.includes('/auth/check-auth')
        ) {
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
                await refreshAuthSession();

                processQueue(null);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (err) {
                // Another tab may have already rotated refresh tokens successfully.
                const user = await recheckAuthAfterRefreshFailure();
                if (user) {
                    processQueue(null);
                    isRefreshing = false;
                    return apiClient(originalRequest);
                }

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
