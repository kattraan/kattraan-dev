// routes/instructor/content.routes.js
const express = require('express');
const router = express.Router();
const Section = require('../../models/Section');
const Chapter = require('../../models/Chapter');
const Content = require('../../models/Content');
const contentController = require('../../controllers/course-controller/content.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createContent, updateContent } = require('../../validations/content');
const { requireContentChapterOwner, requireContentOwner, requireCourseNotPendingReview } = require('../../middleware/courseOwnership');

const getCourseIdFromChapterBody = async (req) => {
  const ch = await Chapter.findById(req.body.chapter).select('section').lean();
  if (!ch) return null;
  const sec = await Section.findById(ch.section).select('course').lean();
  return sec?.course;
};
const getCourseIdFromContentParam = async (req) => {
  const content = await Content.findById(req.params.id).select('chapter').lean();
  if (!content) return null;
  const ch = await Chapter.findById(content.chapter).select('section').lean();
  if (!ch) return null;
  const sec = await Section.findById(ch.section).select('course').lean();
  return sec?.course;
};

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), contentController.getAllContents);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), contentController.getContentById);
router.post('/', authorizeRoles('instructor', 'admin'), requireContentChapterOwner('chapter'), requireCourseNotPendingReview(getCourseIdFromChapterBody), ...createContent, contentController.createContent);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), requireCourseNotPendingReview(getCourseIdFromContentParam), ...updateContent, contentController.updateContent);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireContentOwner('id'), requireCourseNotPendingReview(getCourseIdFromContentParam), contentController.deleteContent);

module.exports = router;
