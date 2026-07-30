import { ROUTES } from '@/config/routes';
import { hasRole } from '@/features/auth/utils/roleUtils';

/**
 * Primary "Start learning" / hero CTA destination.
 * Guests → course catalog (auth required → login, then back); learners → courses; staff → dashboard.
 */
export function getStartLearningPath(isAuthenticated, user) {
  if (!isAuthenticated) return ROUTES.COURSES;
  if (hasRole(user, 'admin')) return ROUTES.ADMIN_DASHBOARD;
  if (hasRole(user, 'instructor')) return ROUTES.INSTRUCTOR_DASHBOARD;
  return ROUTES.COURSES;
}

/** Where to send a user immediately after they authenticate (login, Google One Tap, etc.). */
export function getPostAuthRedirectPath(user) {
  if (!user) return null;
  if (hasRole(user, 'admin')) return ROUTES.ADMIN_DASHBOARD;
  if (hasRole(user, 'instructor')) {
    if (user.status === 'pending_enrollment') return ROUTES.INSTRUCTOR_ENROLLMENT;
    if (user.status === 'pending_approval') return ROUTES.WAITING_APPROVAL;
    return ROUTES.INSTRUCTOR_DASHBOARD;
  }
  return ROUTES.COURSES;
}
