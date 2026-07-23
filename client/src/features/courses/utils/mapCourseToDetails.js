import { normalizeWhatYouWillLearn } from '@/utils/courseDescriptionHtml';
import { getLanguageLabel } from '@/data/languages';

/**
 * Maps API course shape to the courseData shape expected by CourseDetails and CourseSidebar.
 * Used by CourseDetailsPage and admin CourseReviewDetail.
 */
export function mapCourseToDetails(course) {
  if (!course) return null;
  const descriptionText = typeof course.description === 'string' ? course.description : '';
  const sections = course.sections || [];
  const content = sections.map((section) => {
    const chapters = section.chapters || [];
    return {
      title: section.title || 'Section',
      lectures: chapters.length,
      duration: '—',
      chapters: chapters.map((ch) => ({
        id: ch._id,
        title: ch.title || 'Lesson',
        contents: ch.contents || [],
      })),
    };
  });
  const totalLessons = content.reduce((sum, section) => sum + (section.chapters?.length || 0), 0);
  const price = Number(course.price) || 0;
  const originalPrice =
    course.originalPrice != null && !Number.isNaN(Number(course.originalPrice))
      ? Number(course.originalPrice)
      : 0;
  const createdBy = course.createdBy;
  const instructorName = course.instructor?.name ?? course.instructor?.firstName ?? createdBy?.userName ?? 'Instructor';
  // Subtitle under instructor name: only use explicit profile fields on `course.instructor`.
  // Do not use enrollmentData.experience / expertise — they are often short codes (e.g. "y m") not a job title.
  const instructorRole = [course.instructor?.role, course.instructor?.title]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean) || '';
  const instructorBio = createdBy?.enrollmentData?.bio ?? course.instructor?.bio ?? '';
  let instructorImage = course.instructor?.image ?? course.instructor?.avatar ?? createdBy?.avatar ?? createdBy?.profileImage ?? null;
  const whatYouWillLearn = normalizeWhatYouWillLearn(course.whatYouWillLearn);
  let videoPreview = course.thumbnail || course.image || course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  if (typeof videoPreview === 'string') {
    videoPreview = videoPreview.replace('vz-81730109-16e.b-cdn.net', 'kattraan.b-cdn.net').replace('kattraan-storage.b-cdn.net', 'kattraan.b-cdn.net');
  }
  if (typeof instructorImage === 'string') {
    instructorImage = instructorImage.replace('vz-81730109-16e.b-cdn.net', 'kattraan.b-cdn.net').replace('kattraan-storage.b-cdn.net', 'kattraan.b-cdn.net');
  }

  return {
    _id: course._id,
    title: course.title || 'Untitled Course',
    subtitle: typeof course.subtitle === 'string' ? course.subtitle.trim() : '',
    description: descriptionText,
    rating: course.rating != null ? Number(course.rating) || 0 : 0,
    ratingCount: course.ratingCount ?? '0',
    learners: course.learners ?? course.enrolledCount ?? '0',
    instructor: instructorName,
    instructorRole,
    instructorBio,
    instructorImage,
    lastUpdated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—',
    language: getLanguageLabel(course.courseLanguage || course.language) || 'English',
    level: course.level || '',
    durationMinutes: Number(course.duration) || 0,
    totalLessons,
    price,
    originalPrice,
    discount: Number(course.discount) || 0,
    videoPreview,
    whatYouWillLearn,
    content,
  };
}
