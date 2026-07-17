import { io } from 'socket.io-client';

/** Derives the Socket.IO server URL from the same env var apiClient.js uses, minus the /api suffix. */
function resolveSocketUrl() {
    const isProduction = import.meta.env.MODE === 'production';
    const apiUrl = import.meta.env.VITE_API_URL;
    if (isProduction && (apiUrl === undefined || apiUrl === '')) {
        throw new Error(
            'VITE_API_URL is required in production. Set it in your environment or .env file.',
        );
    }
    if (!apiUrl) return 'http://localhost:5000';
    return apiUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
}

let socket = null;

/** Returns the singleton socket instance, creating it (disconnected) on first call. */
export function getSocket() {
    if (!socket) {
        socket = io(resolveSocketUrl(), {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
}

export function connectSocket() {
    const s = getSocket();
    if (!s.connected) s.connect();
    return s;
}

export function disconnectSocket() {
    if (socket?.connected) socket.disconnect();
}
