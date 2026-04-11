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
};

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

  const serverMessage = data?.message;
  const message = typeof serverMessage === 'string' && serverMessage.length > 0 && serverMessage.length < 500
    ? serverMessage
    : (FRIENDLY_MESSAGES[status] || FRIENDLY_MESSAGES[500]);

  return { title, message };
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
