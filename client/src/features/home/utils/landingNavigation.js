import { ROUTES } from '@/config/routes';
import { hasRole } from '@/features/auth/utils/roleUtils';

/**
 * Primary "Start learning" / hero CTA destination.
 * Logged-in learners → dashboard; instructors/admins → their dashboard; guests → course catalog.
 */
export function getStartLearningPath(isAuthenticated, user) {
  if (!isAuthenticated) return ROUTES.COURSES;
  if (hasRole(user, 'admin')) return ROUTES.ADMIN_DASHBOARD;
  if (hasRole(user, 'instructor')) return ROUTES.INSTRUCTOR_DASHBOARD;
  return ROUTES.DASHBOARD;
}
