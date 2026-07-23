/**
 * Auth-related config: public routes (no redirect to login on 401), login path.
 * Used by apiClient 401 interceptor and any auth-aware redirect logic.
 */
import { ROUTES } from './routes';

export const PUBLIC_PATHS = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.CATEGORIES,
  ROUTES.COURSE_DETAILS,
  ROUTES.CERTIFICATE_VERIFY,
  // Certificate viewer opens in its own tab; don't hard-redirect on a transient 401
  // while refresh is still racing with another tab.
  ROUTES.CERTIFICATE_VIEW,
];

export const LOGIN_PATH = ROUTES.LOGIN;
