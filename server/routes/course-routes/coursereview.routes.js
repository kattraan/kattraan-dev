// routes/instructor/coursereview.routes.js
const express = require('express');
const router = express.Router();
const courseReviewController = require('../../controllers/course-controller/coursereview.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createCourseReview, updateCourseReview } = require('../../validations/coursereview');
const { requireCourseReviewOwner } = require('../../middleware/courseOwnership');

router.use(authenticate);

router.get('/', authorizeRoles('learner', 'instructor', 'admin'), courseReviewController.getAllCourseReviews);
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), courseReviewController.getCourseReviewById);
router.post('/', authorizeRoles('learner', 'instructor', 'admin'), ...createCourseReview, courseReviewController.createCourseReview);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireCourseReviewOwner('id'), ...updateCourseReview, courseReviewController.updateCourseReview);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireCourseReviewOwner('id'), courseReviewController.deleteCourseReview);

module.exports = router;
