import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole, isApprovedInstructor, hasEffectiveRole, getInstructorOnboardingPath } from '@/features/auth/utils/roleUtils';
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

  if (allowedRoles.length > 0 && !allowedRoles.some((role) => hasEffectiveRole(user, role))) {
    const instructorOnly =
      allowedRoles.includes('instructor') &&
      !allowedRoles.includes('learner') &&
      !allowedRoles.includes('admin');
    if (instructorOnly) {
      const onboardingPath = getInstructorOnboardingPath(user);
      if (onboardingPath) {
        return <Navigate to={onboardingPath} replace />;
      }
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const isPureLearner =
    hasRole(user, 'learner') &&
    !isApprovedInstructor(user) &&
    !hasRole(user, 'admin');

  if (redirectLearnersTo && isPureLearner) {
    return <Navigate to={redirectLearnersTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
