// routes/instructor/course.routes.js
const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/course-controller/course.controller');
const courseLiveSessionsController = require('../../controllers/course-controller/courseLiveSessions.controller');
const courseLearnerReviewsController = require('../../controllers/course-controller/courseLearnerReviews.controller');
const courseWatchController = require('../../controllers/course-controller/courseWatch.controller');
const assignmentSubmissionsController = require('../../controllers/course-controller/assignmentSubmissionsController');
const { getCourseAnalytics } = require('../../controllers/instructor-controller/courseAnalytics.controller');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { createCourse, updateCourse, cloneCourse } = require('../../validations/course');
const { updateCourseLiveSessions } = require('../../validations/courseLiveSessions');
const {
  createLearnerCourseReview,
  updateLearnerCourseReview,
  updateInstructorReviewMeta,
} = require('../../validations/courseLearnerReview');
const { requireCourseOwner, requireCourseNotPendingReview } = require('../../middleware/courseOwnership');
const { param } = require('express-validator');
const validateRequest = require('../../middleware/validateRequest');

const validateId = [param('id').notEmpty().isMongoId().withMessage('Invalid course ID'), validateRequest];

// Public listing (published only) – no auth required so navbar "Courses" shows approved courses
router.get('/public', courseController.getPublic);

// Learner reviews (published courses): list is public; write requires auth + enrollment
router.get('/:id/reviews/mine', authenticate, validateId, courseLearnerReviewsController.getMyReview);
router.get('/:id/reviews', validateId, courseLearnerReviewsController.listReviews);
router.post('/:id/reviews', authenticate, validateId, ...createLearnerCourseReview, courseLearnerReviewsController.createReview);
router.patch(
  '/:id/reviews/mine',
  authenticate,
  validateId,
  ...updateLearnerCourseReview,
  courseLearnerReviewsController.updateMyReview
);
router.delete('/:id/reviews/mine', authenticate, validateId, courseLearnerReviewsController.deleteMyReview);
router.patch(
  '/:id/reviews/:reviewId/meta',
  authenticate,
  authorizeRoles('instructor', 'admin'),
  requireCourseOwner('id'),
  validateId,
  ...updateInstructorReviewMeta,
  courseLearnerReviewsController.updateInstructorReviewMeta
);

router.use(authenticate);

// Platform routes (authenticated)
router.get('/', authorizeRoles('learner', 'instructor', 'admin'), courseController.getAll);

// Instructor-specific routes
router.get('/instructor', authorizeRoles('instructor', 'admin'), courseController.getInstructorCourses);
router.post('/clone/:id', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), ...cloneCourse, courseController.cloneCourse);

// Submit for admin review (instructor only)
router.patch('/:id/submit-for-review', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), validateId, courseController.submitForReview);

// Assignment submissions (instructor) - must be before GET /:id
router.get('/:id/assignments', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), assignmentSubmissionsController.getAssignmentsForCourse);
router.get('/:id/assignments/:contentId/submissions', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), assignmentSubmissionsController.getSubmissionsForAssignment);
router.patch('/:id/submissions/:submissionId', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), assignmentSubmissionsController.gradeSubmission);

// Course analytics (instructor) - must be before GET /:id
router.get('/:id/analytics', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), validateId, getCourseAnalytics);

// Live sessions (Meet/Zoom links + schedule) — instructor replaces full list
router.put(
  '/:id/live-sessions',
  authorizeRoles('instructor', 'admin'),
  requireCourseOwner('id'),
  requireCourseNotPendingReview((req) => req.params.id),
  ...updateCourseLiveSessions,
  courseLiveSessionsController.updateCourseLiveSessions,
);

// Slim overview for the learner watch-page sidebar (no chapter contents, enrollment-agnostic)
router.get('/:courseId/overview', authorizeRoles('learner', 'instructor', 'admin'), courseWatchController.getCourseOverview);

// Single course management
router.get('/:id', authorizeRoles('learner', 'instructor', 'admin'), courseController.getById);
router.post('/', authorizeRoles('instructor', 'admin'), ...createCourse, courseController.create);
router.put('/:id', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), requireCourseNotPendingReview((req) => req.params.id), ...updateCourse, courseController.update);
router.delete('/:id', authorizeRoles('instructor', 'admin'), requireCourseOwner('id'), requireCourseNotPendingReview((req) => req.params.id), courseController.delete);

module.exports = router;
