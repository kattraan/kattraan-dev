import { ROUTES } from '@/config/routes';

/**
 * First chapter id from editor sections or mapped courseData.content.
 * Prefers chapters that already have lesson content.
 */
export function findFirstPreviewChapterId(courseLike) {
  const sections = courseLike?.sections || courseLike?.content || [];
  let fallback = null;
  for (const section of sections) {
    for (const chapter of section.chapters || []) {
      const id = chapter._id || chapter.id;
      if (!id) continue;
      if (!fallback) fallback = String(id);
      if (Array.isArray(chapter.contents) && chapter.contents.length > 0) {
        return String(id);
      }
    }
  }
  return fallback;
}

/** Creator/staff watch URL that returns to course-details. */
export function buildCourseWatchPreviewUrl(courseId, chapterId) {
  if (!courseId || !chapterId) return null;
  const returnTo = `${ROUTES.COURSE_DETAILS}/${courseId}`;
  return `${ROUTES.VIEW_COURSE}/${courseId}/watch?chapter=${chapterId}&returnTo=${encodeURIComponent(returnTo)}`;
}
