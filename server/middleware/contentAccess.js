/**
 * Gate content metadata reads behind enrollment / course ownership.
 * Prevents authenticated users from enumerating titles, article bodies,
 * resource URLs, and quiz structure across courses they did not buy.
 */
const Content = require('../models/Content');
const videoService = require('../services/video.service');

function resolveUserRole(user) {
  const roles = Array.isArray(user?.roleNames)
    ? user.roleNames.map((r) => String(r).toLowerCase())
    : [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('instructor')) return 'instructor';
  return String(user?.role?.name || user?.roleName || 'learner').toLowerCase();
}

/**
 * GET /:id — require enrolled learner, course owner, or admin.
 */
function requireContentReadAccess(paramName = 'id') {
  return async (req, res, next) => {
    try {
      const contentId = req.params[paramName];
      const content = await Content.findById(contentId).select('chapter isDeleted').lean();
      if (!content || content.isDeleted) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      const courseId = await videoService.getCourseIdFromChapter(content.chapter);
      if (!courseId) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      const authorized = await videoService.isEnrolledOrElevated(
        req.user._id,
        courseId,
        resolveUserRole(req.user),
      );
      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: not enrolled in this course',
        });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}

/**
 * GET / — admins may list everything.
 * Everyone else must pass ?chapter= and be enrolled/owner for that chapter's course.
 * Blocks unscoped enumeration of all curriculum metadata.
 */
function requireContentListAccess() {
  return async (req, res, next) => {
    try {
      const role = resolveUserRole(req.user);
      if (role === 'admin') return next();

      const chapterId = req.query.chapter;
      if (!chapterId) {
        return res.status(403).json({
          success: false,
          message: 'Listing all content is not allowed. Provide a chapter filter.',
        });
      }

      const courseId = await videoService.getCourseIdFromChapter(chapterId);
      if (!courseId) {
        return res.status(404).json({ success: false, message: 'Chapter not found' });
      }

      const authorized = await videoService.isEnrolledOrElevated(
        req.user._id,
        courseId,
        role,
      );
      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: not enrolled in this course',
        });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}

module.exports = {
  resolveUserRole,
  requireContentReadAccess,
  requireContentListAccess,
};
