const express = require('express');
const authenticate = require('../../middleware/auth-middleware');
const { getStreak } = require('../../controllers/learner-controller/streakController');

const router = express.Router();

router.get('/', authenticate, getStreak);

module.exports = router;
