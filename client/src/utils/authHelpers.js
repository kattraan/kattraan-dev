/**
 * Auth helpers for session expiry and logout.
 * Used by apiClient 401 interceptor; keeps auth side effects testable and in one place.
 */
import { LOGIN_PATH } from '@/config/authConfig';
import { PUBLIC_PATHS } from '@/config/authConfig';

/**
 * Clears client-side auth state (e.g. localStorage) and redirects to login when not on a public path.
 * Call this when refresh token fails or session is invalid.
 */
export function clearSessionAndRedirectToLogin() {
  localStorage.removeItem('user');
  const pathname = window.location.pathname;
  const isHome = pathname === '/';
  const isPublic = isHome || PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (!isPublic) {
    window.location.href = LOGIN_PATH;
  }
}
