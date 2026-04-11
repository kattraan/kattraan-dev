// routes/instructor/section.routes.js
const express = require('express');
const router = express.Router();
const Section = require('../../models/Section');
const sectionController = require('../../controllers/course-controller/section.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createSection, updateSection } = require('../../validations/section');
const { requireCourseOwnerFromBody, requireSectionOwner, requireCourseNotPendingReview } = require('../../middleware/courseOwnership');

const getCourseIdFromSectionParam = async (req) => {
  const s = await Section.findById(req.params.id).select('course').lean();
  return s?.course;
};

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), sectionController.getAllSections);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), sectionController.getSectionById);
router.post('/', authorizeRoles('instructor', 'admin'), requireCourseOwnerFromBody('course'), requireCourseNotPendingReview((req) => req.body.course), ...createSection, sectionController.createSection);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireSectionOwner('id'), requireCourseNotPendingReview(getCourseIdFromSectionParam), ...updateSection, sectionController.updateSection);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireSectionOwner('id'), requireCourseNotPendingReview(getCourseIdFromSectionParam), sectionController.deleteSection);

module.exports = router;
