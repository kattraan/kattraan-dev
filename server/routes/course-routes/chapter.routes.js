const express = require('express');
const router = express.Router();
const Section = require('../../models/Section');
const Chapter = require('../../models/Chapter');
const chapterController = require('../../controllers/course-controller/chapter.controller');
const courseWatchController = require('../../controllers/course-controller/courseWatch.controller');
const videoPlayController = require('../../controllers/course-controller/videoPlay.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createChapter, updateChapter } = require('../../validations/chapter');
const { requireChapterSectionOwner, requireChapterOwner, requireCourseNotPendingReview } = require('../../middleware/courseOwnership');

const getCourseIdFromSectionBody = async (req) => {
  const sec = await Section.findById(req.body.section).select('course').lean();
  return sec?.course;
};
const getCourseIdFromChapterParam = async (req) => {
  const ch = await Chapter.findById(req.params.id).select('section').lean();
  if (!ch) return null;
  const sec = await Section.findById(ch.section).select('course').lean();
  return sec?.course;
};

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), chapterController.getAllChapters);

// Learner watch-page: full chapter with contents populated + video URLs signed.
// Requires enrollment (or instructor/admin role).
router.get('/:chapterId/content', authorizeRoles('learner', 'instructor', 'admin'), courseWatchController.getChapterContent);

// Fresh signed Bunny CDN play URL for a chapter's video content.
router.get('/:chapterId/play', authorizeRoles('learner', 'instructor', 'admin'), videoPlayController.getVideoPlayUrl);

router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), chapterController.getChapterById);
router.post('/', authorizeRoles('instructor', 'admin'), requireChapterSectionOwner('section'), requireCourseNotPendingReview(getCourseIdFromSectionBody), ...createChapter, chapterController.createChapter);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireChapterOwner('id'), requireCourseNotPendingReview(getCourseIdFromChapterParam), ...updateChapter, chapterController.updateChapter);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireChapterOwner('id'), requireCourseNotPendingReview(getCourseIdFromChapterParam), chapterController.deleteChapter);

module.exports = router;
