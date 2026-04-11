const courseService = require('../../services/course.service');
const videoService = require('../../services/video.service');

function resolveUserRole(user) {
  const roles = Array.isArray(user?.roleNames)
    ? user.roleNames.map((r) => String(r).toLowerCase())
    : [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('instructor')) return 'instructor';
  return String(user?.role?.name || user?.roleName || 'learner').toLowerCase();
}

/**
 * GET /api/courses/:courseId/overview
 *
 * Returns a slim course document for the learner watch-page sidebar:
 *   - Course metadata (title, image, description, etc.)
 *   - Sections with chapters (id + title + order only)
 *   - Chapter `contents` are NOT included — load them lazily per chapter.
 */
async function getCourseOverview(req, res) {
  try {
    const courseId = req.params.courseId;
    const course = await courseService.getCourseOverview(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Paid course security: only enrolled learners (or elevated roles) can see the overview.
    // Chapter content is already protected; this prevents learners from viewing the structure before payment.
    const coursePrice = Number(course.price) || 0;
    const isPaidCourse = coursePrice > 0;

    if (isPaidCourse) {
      const userId = req.user?._id?.toString();
      const userRole = resolveUserRole(req.user);

      const authorized = await videoService.isEnrolledOrElevated(
        userId,
        courseId,
        userRole,
      );

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: not enrolled in this course',
        });
      }
    }

    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/chapters/:chapterId/content
 *
 * Returns a full chapter with contents populated.
 * Video URLs are replaced with signed Bunny CDN URLs.
 * Requires the user to be enrolled in the parent course (or be instructor/admin).
 */
async function getChapterContent(req, res) {
  try {
    const { chapterId } = req.params;
    const userId = req.user._id.toString();
    const userRole = resolveUserRole(req.user);

    const courseId = await videoService.getCourseIdFromChapter(chapterId);
    if (!courseId) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const authorized = await videoService.isEnrolledOrElevated(userId, courseId, userRole);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: not enrolled in this course',
      });
    }

    const chapter = await courseService.getChapterWithContent(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    res.json({ success: true, data: chapter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getCourseOverview, getChapterContent };
