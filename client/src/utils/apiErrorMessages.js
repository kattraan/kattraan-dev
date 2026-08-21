/**
 * Normalize API error responses for user-facing toasts.
 * Never exposes stack traces or technical details.
 */

const FRIENDLY_MESSAGES = {
  400: 'Please check your input and try again.',
  401: 'Please sign in again.',
  403: "You don't have permission to do this.",
  404: 'The requested item was not found.',
  422: 'Please check your input and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong. Please try again later.',
  502: 'Cannot reach the API. Make sure the server is running, then try again.',
  503: 'The API is temporarily unavailable. Wait a moment and try again.',
  504: 'The API took too long to respond. Please try again.',
};

const API_UNREACHABLE =
  'Cannot reach the API. Make sure the server is running (default port 5000), then refresh and try again.';

function looksLikeHtmlBody(data) {
  if (typeof data === 'string') {
    return /^\s*</.test(data) || /<!DOCTYPE|ECONNREFUSED|Error: connect/i.test(data);
  }
  return false;
}

function extractServerMessage(data) {
  if (!data) return null;
  if (typeof data === 'string') {
    // Vite proxy / Express often returns HTML for dead upstreams — not useful to show.
    if (looksLikeHtmlBody(data)) return null;
    const trimmed = data.trim();
    return trimmed.length > 0 && trimmed.length < 500 ? trimmed : null;
  }
  if (typeof data.message === 'string' && data.message.length > 0 && data.message.length < 500) {
    return data.message;
  }
  return null;
}

/**
 * Axios "Network Error" usually means the browser never got a readable response
 * (API down, CORS blocked, proxy offline). Map to an actionable message.
 */
export function isTransientApiError(error) {
  const status = error?.response?.status;
  if (!error?.response) {
    const raw = error?.message || '';
    return /network error/i.test(raw) || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED';
  }
  return status === 502 || status === 503 || status === 504;
}

export function getAuthErrorMessage(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const serverMessage = extractServerMessage(data);

  if (serverMessage) return serverMessage;

  // Dead / restarting API via Vite proxy → HTML 5xx with no JSON message
  if (looksLikeHtmlBody(data) || status === 502 || status === 503 || status === 504) {
    return FRIENDLY_MESSAGES[status] || API_UNREACHABLE;
  }

  if (!error?.response) {
    const raw = error?.message || '';
    if (/network error/i.test(raw) || error?.code === 'ERR_NETWORK') {
      return API_UNREACHABLE;
    }
    if (error?.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
  }

  return rawMessageOrFallback(error);
}

function rawMessageOrFallback(error) {
  const status = error?.response?.status;
  return FRIENDLY_MESSAGES[status] || error?.message || FRIENDLY_MESSAGES[500];
}

/**
 * @param {import('axios').AxiosError} error - Axios error from API call
 * @returns {{ title: string, message: string }} Safe title and message for toast
 */
export function getApiErrorForToast(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const title = status === 400 && data?.errors?.length ? 'Validation error' : 'Error';

  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const messages = data.errors.map((e) => e.message || '').filter(Boolean);
    const message = messages.length > 0
      ? messages.join('. ')
      : (data.message || FRIENDLY_MESSAGES[status] || FRIENDLY_MESSAGES[500]);
    return { title, message };
  }

  return { title, message: getAuthErrorMessage(error) };
}

/**
 * Attach user-friendly message to error for use in catch blocks (e.g. toast.error(title, error.apiMessage)).
 * Call this in a response interceptor or when handling errors.
 * @param {import('axios').AxiosError} error
 */
export function attachApiMessage(error) {
  if (error && !error.apiMessageForToast) {
    const { title, message } = getApiErrorForToast(error);
    error.apiMessageForToast = { title, message };
  }
  return error;
}
