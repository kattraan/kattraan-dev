const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { param, body } = require('express-validator');
const validateRequest = require('../../middleware/validateRequest');
const { getPendingCourses, approveCourse, rejectCourse } = require('../../controllers/admin-controller/courseReview.controller');

router.use(authenticate);
router.use(authorizeRoles('admin'));

const validateId = [param('id').notEmpty().isMongoId().withMessage('Invalid course ID'), validateRequest];

// GET /api/admin/courses/pending
router.get('/courses/pending', getPendingCourses);

// PATCH /api/admin/courses/:id/approve
router.patch('/courses/:id/approve', validateId, approveCourse);

// PATCH /api/admin/courses/:id/reject (body: { rejectionReason: string })
router.patch(
  '/courses/:id/reject',
  validateId,
  [body('rejectionReason').notEmpty().trim().withMessage('Rejection reason is required')],
  validateRequest,
  rejectCourse
);

module.exports = router;
