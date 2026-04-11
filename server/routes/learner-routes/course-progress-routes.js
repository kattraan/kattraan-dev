const express = require('express');
const { getProgress, updateProgress } = require('../../controllers/learner-controller/courseProgressController');
const authenticate = require('../../middleware/auth-middleware');

const router = express.Router();

router.get('/:courseId', authenticate, getProgress);
router.patch('/', authenticate, updateProgress);

module.exports = router;
