const progressService = require('../../services/progress.service');

/**
 * GET /api/learner/course-progress/:courseId
 * Returns saved progress for the authenticated user and course.
 * Responds with 403 when the user is not enrolled in the requested course.
 */
async function getProgress(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId } = req.params;

    const enrolled = await progressService.isEnrolled(userId, courseId);
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'Access denied: not enrolled in this course' });
    }

    const data = await progressService.fetchProgress(userId, courseId);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * PATCH /api/learner/course-progress
 * Body: { courseId, chapterId, currentTime, duration }
 * Responds with 403 when the user is not enrolled.
 * Completion is derived server-side from currentTime/duration (anti-cheat).
 */
async function updateProgress(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId, chapterId, currentTime, duration } = req.body;

    if (!courseId || !chapterId) {
      return res.status(400).json({ success: false, message: 'courseId and chapterId are required' });
    }

    const enrolled = await progressService.isEnrolled(userId, courseId);
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'Access denied: not enrolled in this course' });
    }

    const entry = await progressService.saveProgress(userId, {
      courseId,
      chapterId,
      currentTime,
      duration,
    });

    res.json({
      success: true,
      data: {
        courseId,
        chapterId,
        currentTime: entry.currentTime,
        duration: entry.duration,
        watchedPercentage: entry.watchedPercentage,
        completed: entry.completed,
      },
    });
  } catch (err) {
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = { getProgress, updateProgress };
