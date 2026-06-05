import { courseDescriptionPlainText } from '@/utils/courseDescriptionHtml';

function formatLandingDuration(durationMinutes) {
  const mins = Number(durationMinutes);
  if (!Number.isFinite(mins) || mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

/**
 * Map a public API course to the landing carousel card shape.
 */
export function mapPublicCourseToLandingCard(course) {
  const id = course._id || course.id;
  const sectionsCount = Array.isArray(course.sections) ? course.sections.length : 0;
  const enrolled = course.enrolledCount ?? course.learners ?? 0;

  return {
    _id: id,
    id,
    title: course.title || 'Untitled Course',
    category: course.category || 'Course',
    rating:
      course.averageRating != null
        ? String(Number(course.averageRating).toFixed(1))
        : '4.5',
    description: courseDescriptionPlainText(course.description) || '',
    lessons: String(sectionsCount || 0).padStart(2, '0'),
    duration: formatLandingDuration(course.durationMinutes),
    projects: String(enrolled),
    image: course.thumbnail || course.image || null,
    enrolledCount: enrolled,
    createdAt: course.createdAt,
  };
}
