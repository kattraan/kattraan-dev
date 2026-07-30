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
    // Dev without VITE_API_URL: same-origin via Vite /socket.io proxy (cookies work).
    if (!apiUrl) return undefined;
    const socketUrl = apiUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
    // Dev: localhost API on another port won't receive SameSite=Lax cookies — use Vite proxy.
    if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(socketUrl)) {
        return undefined;
    }
    return socketUrl;
}

let socket = null;

/** Returns the singleton socket instance, creating it (disconnected) on first call. */
export function getSocket() {
    if (!socket) {
        const url = resolveSocketUrl();
        socket = io(url, {
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

/** Emits a socket event once the connection is ready (connects if needed). */
export function emitWhenConnected(event, payload) {
    const s = getSocket();
    const emit = () => s.emit(event, payload);
    if (s.connected) {
        emit();
        return;
    }
    connectSocket();
    if (s.connected) {
        emit();
        return;
    }
    s.once('connect', emit);
}

export function disconnectSocket() {
    if (socket?.connected) socket.disconnect();
}
