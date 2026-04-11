const express = require('express');
const authenticate = require('../../middleware/auth-middleware');
const authorizeRoles = require('../../middleware/role-middleware');
const { getInstructorStats } = require('../../controllers/instructor-controller/stats.controller');

const router = express.Router();

router.get('/', authenticate, authorizeRoles('instructor', 'admin'), getInstructorStats);

module.exports = router;
