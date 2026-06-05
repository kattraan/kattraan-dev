import { useMemo } from 'react';
import { useGetPublicCoursesQuery } from '@/features/courses/api/coursesApi';
import { FALLBACK_LANDING_COURSES } from '@/features/home/constants/fallbackLandingCourses';
import { mapPublicCourseToLandingCard } from '@/features/home/utils/mapLandingCourse';

export function useLandingPublicCourses() {
  const { data: raw = [], isLoading, isError } = useGetPublicCoursesQuery();

  const apiCourses = useMemo(
    () => (Array.isArray(raw) ? raw : []).map(mapPublicCourseToLandingCard),
    [raw]
  );

  const hasApiCourses = apiCourses.length > 0;
  const courses = hasApiCourses ? apiCourses : FALLBACK_LANDING_COURSES;

  const topRated = useMemo(
    () =>
      [...courses]
        .sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0))
        .slice(0, 8),
    [courses]
  );

  const inDemand = useMemo(() => {
    if (!hasApiCourses) return courses;
    return [...courses]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [courses, hasApiCourses]);

  const trending = useMemo(() => courses.slice(0, 4), [courses]);

  return {
    courses,
    topRated,
    inDemand,
    trending,
    isLoading,
    isError,
    hasApiCourses,
  };
}
