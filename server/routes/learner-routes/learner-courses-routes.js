const express = require('express');
const {
  getMyCourses,
  checkEnrollment,
  enrollCourse,
  getMyLiveSessions,
} = require('../../controllers/learner-controller/learnerCoursesController');
const authenticate = require('../../middleware/auth-middleware');

const router = express.Router();

router.get('/', authenticate, getMyCourses);
router.get('/live-sessions', authenticate, getMyLiveSessions);
router.get('/check/:courseId', authenticate, checkEnrollment);
router.post('/enroll', authenticate, enrollCourse);

module.exports = router;
