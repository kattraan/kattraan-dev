import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { hasRole } from '@/features/auth/utils/roleUtils';
import {
  ENROLLMENT_CHANGED_EVENT,
  getMyEnrolledCourses,
} from '@/features/learner/services/learnerCoursesService';

const LearnerEnrollmentContext = createContext(null);

export function LearnerEnrollmentProvider({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLearner =
    isAuthenticated &&
    !hasRole(user, 'instructor') &&
    !hasRole(user, 'admin');

  const refreshEnrollments = useCallback(async () => {
    if (!isLearner) {
      setHasEnrolledCourses(false);
      return [];
    }

    setLoading(true);
    try {
      const courses = await getMyEnrolledCourses();
      const enrolled = Array.isArray(courses) && courses.length > 0;
      setHasEnrolledCourses(enrolled);
      return courses;
    } catch {
      setHasEnrolledCourses(false);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isLearner]);

  const markEnrolled = useCallback(() => {
    setHasEnrolledCourses(true);
  }, []);

  useEffect(() => {
    if (!isLearner) {
      setHasEnrolledCourses(false);
      return;
    }

    refreshEnrollments();
  }, [isLearner, user?._id, refreshEnrollments]);

  useEffect(() => {
    if (!isLearner) return undefined;

    const onEnrollmentChanged = () => {
      markEnrolled();
      refreshEnrollments();
    };

    window.addEventListener(ENROLLMENT_CHANGED_EVENT, onEnrollmentChanged);
    return () => {
      window.removeEventListener(ENROLLMENT_CHANGED_EVENT, onEnrollmentChanged);
    };
  }, [isLearner, markEnrolled, refreshEnrollments]);

  const value = useMemo(
    () => ({
      hasEnrolledCourses,
      loading,
      refreshEnrollments,
      markEnrolled,
    }),
    [hasEnrolledCourses, loading, refreshEnrollments, markEnrolled],
  );

  return (
    <LearnerEnrollmentContext.Provider value={value}>
      {children}
    </LearnerEnrollmentContext.Provider>
  );
}

export function useLearnerEnrollment() {
  const ctx = useContext(LearnerEnrollmentContext);
  if (!ctx) {
    throw new Error('useLearnerEnrollment must be used within LearnerEnrollmentProvider');
  }
  return ctx;
}
