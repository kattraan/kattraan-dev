import { mapPublicCourseToLandingCard } from '@/features/home/utils/mapLandingCourse';

/**
 * Pick public courses the learner has not enrolled in yet.
 */
export function buildRecommendedCourses(publicCourses = [], enrolledCourseIds = [], limit = 3) {
  const enrolled = new Set(
    (enrolledCourseIds || []).map((id) => String(id)).filter(Boolean),
  );

  const candidates = (Array.isArray(publicCourses) ? publicCourses : [])
    .map(mapPublicCourseToLandingCard)
    .filter((course) => course.id && !enrolled.has(String(course.id)));

  return [...candidates]
    .sort((a, b) => {
      const aHas = (a.ratingValue ?? 0) > 0;
      const bHas = (b.ratingValue ?? 0) > 0;
      if (aHas || bHas) {
        const ratingDiff = (b.ratingValue ?? 0) - (a.ratingValue ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
      }
      return (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0);
    })
    .slice(0, limit);
}
