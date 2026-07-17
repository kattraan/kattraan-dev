import { useMemo } from 'react';
import { useGetPublicCoursesQuery } from '@/features/courses/api/coursesApi';
import { mapPublicCourseToLandingCard } from '@/features/home/utils/mapLandingCourse';

/**
 * Public courses for the landing page.
 * Never returns placeholder/fallback courses — while loading, lists are empty
 * and `isLoading` is true so UI can show skeletons instead of flashing dummy cards.
 */
export function useLandingPublicCourses() {
  // Small + lite payload for the homepage (skips heavy duration aggregation on the API).
  const { data: raw = [], isLoading, isFetching, isError } = useGetPublicCoursesQuery({
    page: 1,
    limit: 8,
    lite: true,
  });

  const courses = useMemo(
    () => (Array.isArray(raw) ? raw : []).map(mapPublicCourseToLandingCard),
    [raw],
  );

  // Prefer real ratings when present; otherwise popularity (enrollments).
  const topRated = useMemo(
    () =>
      [...courses]
        .sort((a, b) => {
          const aHas = (a.ratingValue ?? 0) > 0;
          const bHas = (b.ratingValue ?? 0) > 0;
          if (aHas || bHas) {
            const ratingDiff = (b.ratingValue ?? 0) - (a.ratingValue ?? 0);
            if (ratingDiff !== 0) return ratingDiff;
          }
          return (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0);
        })
        .slice(0, 8),
    [courses],
  );

  const inDemand = useMemo(
    () =>
      [...courses]
        .sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0))
        .slice(0, 8),
    [courses],
  );

  const trending = useMemo(() => courses.slice(0, 4), [courses]);

  // Treat initial fetch as loading so callers never briefly paint empty→fallback→real.
  const loading = isLoading || (isFetching && courses.length === 0);

  return {
    courses,
    topRated,
    inDemand,
    trending,
    isLoading: loading,
    isError,
    hasApiCourses: courses.length > 0,
  };
}
