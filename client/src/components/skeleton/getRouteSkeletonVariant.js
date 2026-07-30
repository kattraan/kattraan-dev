import { ROUTES } from '@/config/routes';

/**
 * Maps a pathname to a skeleton layout + content variant.
 * Used by RouteSkeleton for auth guards and Suspense fallbacks.
 */
export function getRouteSkeletonVariant(pathname) {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';

  // Admin dashboard
  if (path.startsWith(ROUTES.ADMIN_DASHBOARD)) {
    if (path === ROUTES.ADMIN_DASHBOARD) {
      return { layout: 'dashboard', variant: 'admin' };
    }
    if (path === ROUTES.ADMIN_USERS) {
      return { layout: 'dashboard', variant: 'table' };
    }
    if (
      path === ROUTES.ADMIN_INSTRUCTORS ||
      path === ROUTES.ADMIN_COURSES ||
      path.startsWith(`${ROUTES.ADMIN_COURSE_REVIEW}/`)
    ) {
      return { layout: 'dashboard', variant: 'cardList' };
    }
    if (path === ROUTES.ADMIN_COMMUNITIES || path.startsWith(`${ROUTES.ADMIN_COMMUNITIES}/`)) {
      return { layout: 'dashboard', variant: 'list' };
    }
    if (path === ROUTES.ADMIN_SETTINGS) {
      return { layout: 'dashboard', variant: 'form' };
    }
    return { layout: 'dashboard', variant: 'admin' };
  }

  // Instructor dashboard
  if (path.startsWith(ROUTES.INSTRUCTOR_DASHBOARD)) {
    if (path === ROUTES.INSTRUCTOR_DASHBOARD || path === ROUTES.INSTRUCTOR_ANALYTICS) {
      return { layout: 'dashboard', variant: 'instructor' };
    }
    if (
      path === ROUTES.INSTRUCTOR_MY_COURSES ||
      path === ROUTES.INSTRUCTOR_CREATE_COURSE
    ) {
      return { layout: 'dashboard', variant: 'courseGrid' };
    }
    if (path === ROUTES.INSTRUCTOR_LEARNERS) {
      return { layout: 'dashboard', variant: 'table' };
    }
    if (
      path === ROUTES.INSTRUCTOR_COMMUNITY ||
      path.startsWith(`${ROUTES.INSTRUCTOR_COMMUNITY}/`)
    ) {
      return { layout: 'dashboard', variant: 'list' };
    }
    if (path === ROUTES.INSTRUCTOR_SETTINGS) {
      return { layout: 'dashboard', variant: 'form' };
    }
    return { layout: 'dashboard', variant: 'instructor' };
  }

  // Learner dashboard
  if (path.startsWith(ROUTES.DASHBOARD)) {
    if (path === ROUTES.DASHBOARD) {
      return { layout: 'dashboard', variant: 'learner' };
    }
    if (path === ROUTES.DASHBOARD_MY_COURSES) {
      return { layout: 'dashboard', variant: 'courseGrid' };
    }
    if (path === ROUTES.DASHBOARD_CLASSES || path === ROUTES.DASHBOARD_ASSIGNMENTS) {
      return { layout: 'dashboard', variant: 'list' };
    }
    if (path === ROUTES.DASHBOARD_CERTIFICATES) {
      return { layout: 'dashboard', variant: 'cardList' };
    }
    if (
      path === ROUTES.DASHBOARD_PROFILE ||
      path === ROUTES.DASHBOARD_MY_ACCOUNT ||
      path.startsWith(`${ROUTES.DASHBOARD_MY_ACCOUNT}/`) ||
      path === ROUTES.DASHBOARD_SETTINGS ||
      path === ROUTES.DASHBOARD_PERSONAL_DETAILS ||
      path === ROUTES.DASHBOARD_SOCIAL_ACCOUNTS ||
      path === ROUTES.DASHBOARD_PAYMENT_DETAILS ||
      path === ROUTES.DASHBOARD_UPDATE_CONTACT
    ) {
      return { layout: 'dashboard', variant: 'form' };
    }
    if (path === ROUTES.COMMUNITY || path.startsWith(`${ROUTES.COMMUNITY}/`)) {
      return { layout: 'dashboard', variant: 'list' };
    }
    return { layout: 'dashboard', variant: 'learner' };
  }

  // Standalone protected pages
  if (path.startsWith(ROUTES.VIEW_COURSE)) {
    return { layout: 'courseView', variant: 'courseView' };
  }
  if (path.startsWith(ROUTES.COURSE_DETAILS)) {
    return { layout: 'courseDetails', variant: 'courseDetails' };
  }
  if (path.startsWith(ROUTES.CHECKOUT)) {
    return { layout: 'checkout', variant: 'checkout' };
  }
  if (path === ROUTES.CART) {
    return { layout: 'main', variant: 'cart' };
  }
  if (path === ROUTES.COURSES || path === ROUTES.CATEGORIES) {
    return { layout: 'main', variant: 'courseGrid' };
  }

  // Auth pages
  const authPaths = [
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.INSTRUCTOR_SIGNUP,
    ROUTES.INSTRUCTOR_ENROLLMENT,
    ROUTES.WAITING_APPROVAL,
  ];
  if (authPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return { layout: 'minimal', variant: 'auth' };
  }

  // Public marketing
  if (path === ROUTES.HOME) {
    return { layout: 'minimal', variant: 'landing' };
  }

  return { layout: 'minimal', variant: 'default' };
}
