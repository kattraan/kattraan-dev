const streakService = require('../../services/streak.service');

/**
 * GET /api/learner/streak
 * Returns the authenticated learner's learning streak stats.
 */
async function getStreak(req, res) {
  try {
    const userId = req.user._id.toString();
    const data = await streakService.getStreakStats(userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getStreak };
