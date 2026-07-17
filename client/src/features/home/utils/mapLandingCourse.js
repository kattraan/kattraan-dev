import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';

function formatLandingDuration(durationMinutes) {
  const mins = Number(durationMinutes);
  if (!Number.isFinite(mins) || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

/**
 * Map a public API course to the landing carousel card shape.
 * Does not invent ratings or project counts.
 */
export function mapPublicCourseToLandingCard(course) {
  const id = course._id || course.id;
  const sectionsCount = Array.isArray(course.sections) ? course.sections.length : 0;
  const enrolled = course.enrolledCount ?? course.learners ?? 0;
  const hasRating =
    course.averageRating != null && Number.isFinite(Number(course.averageRating));
  const ratingValue = hasRating ? Number(course.averageRating) : 0;

  return {
    _id: id,
    id,
    title: course.title || 'Untitled Course',
    category: course.category || 'Course',
    rating: hasRating ? ratingValue.toFixed(1) : null,
    ratingValue,
    description: courseDescriptionPlainText(course.description) || '',
    lessons: sectionsCount > 0 ? String(sectionsCount).padStart(2, '0') : null,
    duration: formatLandingDuration(course.durationMinutes),
    learners: enrolled > 0 ? String(enrolled) : null,
    image: course.thumbnail || course.image || null,
    enrolledCount: enrolled,
    createdAt: course.createdAt,
  };
}
