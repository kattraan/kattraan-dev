const Course = require("../models/Course");
const Section = require("../models/Section");
const Chapter = require("../models/Chapter");
const Content = require("../models/Content");
const Comment = require("../models/Comment");
const CourseReview = require("../models/CourseReview");
const Media = require("../models/Media");

/**
 * OWNERSHIP PROTECTION (CRITICAL)
 * Course owner = course.createdBy (instructor who created the course).
 * Check: course.createdBy === req.user._id (or user is admin).
 * All modifying routes (PUT/DELETE/POST on course/section/chapter/content) must use
 * these middlewares so Instructor A cannot modify Instructor B's data → 403.
 */

/**
 * Check if the current user can edit a course (must be course owner or admin).
 * @param {object} req - Express request (req.user._id, req.user.roleNames)
 * @param {string} courseId - MongoDB course _id
 * @returns {Promise<{ ok?: true, notFound?: true, forbidden?: true }>}
 */
async function ensureUserCanEditCourse(req, courseId) {
  if (!courseId) return { forbidden: true };
  const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } }).select("createdBy").lean();
  if (!course) return { notFound: true };
  const isAdmin =
    req.user &&
    req.user.roleNames &&
    req.user.roleNames.map((r) => String(r).toLowerCase()).includes("admin");
  if (isAdmin) return { ok: true };
  if (String(course.createdBy) !== String(req.user._id)) return { forbidden: true };
  return { ok: true };
}

/**
 * Middleware: require course ownership for routes with course id in params (e.g. PUT/DELETE /courses/:id).
 */
function requireCourseOwner(paramName = "id") {
  return async (req, res, next) => {
    const courseId = req.params[paramName];
    const result = await ensureUserCanEditCourse(req, courseId);
    if (result.notFound)
      return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit your own courses" });
    next();
  };
}

/**
 * Middleware: require course ownership when course id is in req.body (e.g. POST section with body.course).
 */
function requireCourseOwnerFromBody(bodyField = "course") {
  return async (req, res, next) => {
    const courseId = req.body && req.body[bodyField];
    const result = await ensureUserCanEditCourse(req, courseId);
    if (result.notFound)
      return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only add sections to your own courses" });
    next();
  };
}

/**
 * Middleware: load section by id, then require course ownership (for section update/delete).
 */
function requireSectionOwner(paramName = "id") {
  return async (req, res, next) => {
    const section = await Section.findById(req.params[paramName]).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit sections in your own courses" });
    next();
  };
}

/**
 * Middleware: for chapter create, require course ownership via body.section.
 */
function requireChapterSectionOwner(bodyField = "section") {
  return async (req, res, next) => {
    const sectionId = req.body && req.body[bodyField];
    if (!sectionId) return next();
    const section = await Section.findById(sectionId).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only add chapters to your own courses" });
    next();
  };
}

/**
 * Middleware: load chapter by id, then require course ownership (for chapter update/delete).
 */
function requireChapterOwner(paramName = "id") {
  return async (req, res, next) => {
    const chapter = await Chapter.findById(req.params[paramName]).select("section").lean();
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });
    const section = await Section.findById(chapter.section).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit chapters in your own courses" });
    next();
  };
}

/**
 * Middleware: load content by id (works for any content type), then require course ownership (for content update/delete).
 */
function requireContentOwner(paramName = "id") {
  return async (req, res, next) => {
    const content = await Content.findById(req.params[paramName]).select("chapter").lean();
    if (!content) return res.status(404).json({ success: false, message: "Content not found" });
    const chapter = await Chapter.findById(content.chapter).select("section").lean();
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });
    const section = await Section.findById(chapter.section).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit content in your own courses" });
    next();
  };
}

/**
 * Middleware: for content create, require course ownership via body.chapter (chapter -> section -> course).
 */
function requireContentChapterOwner(bodyField = "chapter") {
  return async (req, res, next) => {
    const chapterId = req.body && req.body[bodyField];
    if (!chapterId) return next();
    const chapter = await Chapter.findById(chapterId).select("section").lean();
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });
    const section = await Section.findById(chapter.section).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Course not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only add content to your own courses" });
    next();
  };
}

/**
 * Middleware: load comment by id, resolve content -> chapter -> section -> course, require course ownership (for comment update).
 */
function requireCommentOwner(paramName = "id") {
  return async (req, res, next) => {
    const comment = await Comment.findById(req.params[paramName]).select("content").lean();
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    const content = await Content.findById(comment.content).select("chapter").lean();
    if (!content) return res.status(404).json({ success: false, message: "Content not found" });
    const chapter = await Chapter.findById(content.chapter).select("section").lean();
    if (!chapter) return res.status(404).json({ success: false, message: "Chapter not found" });
    const section = await Section.findById(chapter.section).select("course").lean();
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    const result = await ensureUserCanEditCourse(req, section.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit comments in your own courses" });
    next();
  };
}

/**
 * Middleware: load course review by id, require course ownership (for review update/delete).
 */
function requireCourseReviewOwner(paramName = "id") {
  return async (req, res, next) => {
    const review = await CourseReview.findById(req.params[paramName]).select("course").lean();
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    const result = await ensureUserCanEditCourse(req, review.course);
    if (result.notFound) return res.status(404).json({ success: false, message: "Course not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only edit reviews on your own courses" });
    next();
  };
}

/**
 * Middleware: load media by key, require course ownership (for media delete).
 * Resolves: Media → course → course.createdBy === req.user._id (or admin).
 * Attaches req.media for the controller. Returns 404 if media not found or soft-deleted.
 */
function requireMediaOwner(paramName = "key") {
  return async (req, res, next) => {
    const rawKey = req.params[paramName];
    if (!rawKey) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }
    const key = decodeURIComponent(rawKey).trim();
    const media = await Media.findOne({ key, isDeleted: { $ne: true } }).select("course key");
    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }
    const result = await ensureUserCanEditCourse(req, media.course);
    if (result.notFound) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (result.forbidden) {
      return res.status(403).json({ success: false, message: "You can only delete media for your own courses" });
    }
    req.media = media;
    next();
  };
}

/**
 * Block curriculum/course edits when course status is pending_approval.
 * getCourseId: (req) => courseId (string) or Promise<courseId>
 */
function requireCourseNotPendingReview(getCourseId) {
  return async (req, res, next) => {
    try {
      let courseId = typeof getCourseId === "function" ? getCourseId(req) : null;
      if (courseId && typeof courseId.then === "function") courseId = await courseId;
      if (!courseId) return next();
      const course = await Course.findById(courseId).select("status").lean();
      if (!course) return next();
      if (course.status === "pending_approval") {
        return res.status(403).json({
          success: false,
          message: "Course is under review. Edits are disabled until admin approves or rejects.",
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}

module.exports = {
  ensureUserCanEditCourse,
  requireCourseOwner,
  requireCourseOwnerFromBody,
  requireSectionOwner,
  requireChapterSectionOwner,
  requireChapterOwner,
  requireContentOwner,
  requireContentChapterOwner,
  requireCommentOwner,
  requireCourseReviewOwner,
  requireMediaOwner,
  requireCourseNotPendingReview,
};
