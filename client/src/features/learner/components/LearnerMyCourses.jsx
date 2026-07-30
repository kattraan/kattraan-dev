import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EnrolledCoursesGrid from './EnrolledCoursesGrid';
import { getMyEnrolledCourses } from '@/features/learner/services/learnerCoursesService';
import { ROUTES } from '@/config/routes';

const LearnerMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyEnrolledCourses()
      .then((data) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load courses.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout
      title="My Courses"
      subtitle="Continue exactly where you left off."
    >
      <div className="pb-20">
        <EnrolledCoursesGrid
          courses={courses}
          loading={loading}
          error={error}
          returnTo={ROUTES.DASHBOARD_MY_COURSES}
        />
      </div>
    </DashboardLayout>
  );
};

export default LearnerMyCourses;
