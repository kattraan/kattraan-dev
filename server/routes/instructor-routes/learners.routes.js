const express = require('express');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { getInstructorLearners } = require('../../controllers/instructor-controller/learners.controller');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('instructor', 'admin'), getInstructorLearners);

module.exports = router;
