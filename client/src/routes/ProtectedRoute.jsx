import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { ROUTES } from '@/config/routes';

/**
 * Protects routes by authentication and optional role.
 * Shows a skeleton screen while the initial auth check is in-flight so the
 * layout is never blocked at the root App level.
 * @param {Array<string>} allowedRoles - Optional list of roles allowed to access the route
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Auth check still in-flight – show skeleton instead of a premature redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c091a] flex flex-col gap-4 p-8 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-white/10" />
        <div className="h-6 w-96 rounded bg-white/10" />
        <div className="h-6 w-72 rounded bg-white/10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some((role) => hasRole(user, role))) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (hasRole(user, 'instructor') && location.pathname.startsWith(ROUTES.INSTRUCTOR_DASHBOARD)) {
    if (user.status === 'pending_enrollment') return <Navigate to={ROUTES.INSTRUCTOR_ENROLLMENT} replace />;
    if (user.status === 'pending_approval') return <Navigate to={ROUTES.WAITING_APPROVAL} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
