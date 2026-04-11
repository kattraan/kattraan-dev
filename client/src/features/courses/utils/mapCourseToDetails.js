/**
 * Maps API course shape to the courseData shape expected by CourseDetails and CourseSidebar.
 * Used by CourseDetailsPage and admin CourseReviewDetail.
 */
export function mapCourseToDetails(course) {
  if (!course) return null;
  const descriptionText = typeof course.description === 'string' ? course.description : '';
  const descriptionPoints = descriptionText
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const price = Number(course.price) ?? 0;
  const originalPrice = course.originalPrice != null ? Number(course.originalPrice) : (price > 0 ? Math.round(price * 1.5) : 0);
  const createdBy = course.createdBy;
  const instructorName = course.instructor?.name ?? course.instructor?.firstName ?? createdBy?.userName ?? 'Instructor';
  // Subtitle under instructor name: only use explicit profile fields on `course.instructor`.
  // Do not use enrollmentData.experience / expertise — they are often short codes (e.g. "y m") not a job title.
  const instructorRole = [course.instructor?.role, course.instructor?.title]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean) || '';
  const instructorBio = createdBy?.enrollmentData?.bio ?? course.instructor?.bio ?? '';
  const instructorImage = course.instructor?.image ?? course.instructor?.avatar ?? createdBy?.avatar ?? createdBy?.profileImage ?? null;
  const whatYouWillLearn = course.whatYouWillLearn && Array.isArray(course.whatYouWillLearn)
    ? course.whatYouWillLearn
    : descriptionPoints;
  const videoPreview = course.thumbnail || course.image || course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  return {
    _id: course._id,
    title: course.title || 'Untitled Course',
    description: descriptionText,
    rating: course.rating ?? 4.5,
    ratingCount: course.ratingCount ?? '0',
    learners: course.learners ?? course.enrolledCount ?? '0',
    instructor: instructorName,
    instructorRole,
    instructorBio,
    instructorImage,
    lastUpdated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—',
    language: course.language || 'English',
    price,
    originalPrice,
    discountTime: 'Limited Time',
    videoPreview,
    whatYouWillLearn: whatYouWillLearn.length ? whatYouWillLearn : ['Key concepts and skills covered in this course.'],
    content,
  };
}
