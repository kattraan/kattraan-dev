import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { ROUTES } from '@/config/routes';
import DashboardSkeleton from '@/components/common/DashboardSkeleton';

/**
 * Protects routes by authentication and optional role.
 * Shows a skeleton screen while the initial auth check is in-flight so the
 * layout is never blocked at the root App level.
 * @param {Array<string>} allowedRoles - Optional list of roles allowed to access the route
 * @param {string|null} redirectLearnersTo - If set, pure learners (not instructor/admin) are redirected here
 */
const ProtectedRoute = ({ allowedRoles = [], redirectLearnersTo = null }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Auth check still in-flight – show route-matched skeleton instead of a premature redirect
  if (loading) {
    return <DashboardSkeleton pathname={location.pathname} />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some((role) => hasRole(user, role))) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const isPureLearner =
    hasRole(user, 'learner') &&
    !hasRole(user, 'instructor') &&
    !hasRole(user, 'admin');

  if (redirectLearnersTo && isPureLearner) {
    return <Navigate to={redirectLearnersTo} replace />;
  }

  if (hasRole(user, 'instructor') && location.pathname.startsWith(ROUTES.INSTRUCTOR_DASHBOARD)) {
    if (user.status === 'pending_enrollment') return <Navigate to={ROUTES.INSTRUCTOR_ENROLLMENT} replace />;
    if (user.status === 'pending_approval') return <Navigate to={ROUTES.WAITING_APPROVAL} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
