import { useMemo } from 'react';
import { useGetLandingCoursesQuery } from '@/features/courses/api/coursesApi';
import { mapPublicCourseToLandingCard } from '@/features/home/utils/mapLandingCourse';

/**
 * Public courses for the landing page.
 * Trending / Popular use admin placements when those lists are saved;
 * otherwise they fall back to recency / ratings.
 */
export function useLandingPublicCourses() {
  const { data, isLoading, isFetching, isError } = useGetLandingCoursesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const courses = useMemo(
    () => (Array.isArray(data?.courses) ? data.courses : []).map(mapPublicCourseToLandingCard),
    [data],
  );

  const featuredTrending = useMemo(
    () => (Array.isArray(data?.trending) ? data.trending : []).map(mapPublicCourseToLandingCard),
    [data],
  );
  const featuredPopular = useMemo(
    () => (Array.isArray(data?.popular) ? data.popular : []).map(mapPublicCourseToLandingCard),
    [data],
  );

  const autoTopRated = useMemo(
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

  const autoTrending = useMemo(() => courses.slice(0, 4), [courses]);
  const trending = data?.trendingManual || featuredTrending.length > 0 ? featuredTrending : autoTrending;
  const topRated = data?.popularManual || featuredPopular.length > 0 ? featuredPopular : autoTopRated;

  const loading = isLoading || (isFetching && courses.length === 0 && featuredTrending.length === 0);

  return {
    courses,
    topRated,
    inDemand,
    trending,
    isLoading: loading,
    isError,
    hasApiCourses: courses.length > 0 || trending.length > 0 || topRated.length > 0,
  };
}
