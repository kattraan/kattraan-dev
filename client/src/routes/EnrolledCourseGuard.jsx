import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasRole } from '@/features/auth/utils/roleUtils';
import { getMyEnrolledCourses } from '@/features/learner/services/learnerCoursesService';
import { ROUTES } from '@/config/routes';
import DashboardSkeleton from '@/components/common/DashboardSkeleton';

/**
 * Blocks learner dashboard routes until the user has enrolled in at least one course.
 * Admins bypass this check so they can review the learner experience.
 */
const EnrolledCourseGuard = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // loading | enrolled | not-enrolled

  const isAdmin = hasRole(user, 'admin');

  useEffect(() => {
    if (isAdmin) {
      setStatus('enrolled');
      return;
    }

    let cancelled = false;

    getMyEnrolledCourses()
      .then((courses) => {
        if (cancelled) return;
        setStatus(Array.isArray(courses) && courses.length > 0 ? 'enrolled' : 'not-enrolled');
      })
      .catch(() => {
        if (!cancelled) setStatus('not-enrolled');
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (status === 'loading') {
    return <DashboardSkeleton pathname={location.pathname} />;
  }

  if (status === 'not-enrolled') {
    return (
      <Navigate
        to={ROUTES.COURSES}
        replace
        state={{ enrollmentRequired: true }}
      />
    );
  }

  return <Outlet />;
};

export default EnrolledCourseGuard;
