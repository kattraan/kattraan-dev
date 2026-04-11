const CourseProgress = require('../models/CourseProgress');
const LearnerCourses = require('../models/LearnerCourses');

const COMPLETION_THRESHOLD = 90;

/**
 * Return true if the user is enrolled in the course.
 * @param {string} userId
 * @param {string} courseId
 * @returns {Promise<boolean>}
 */
async function isEnrolled(userId, courseId) {
  const doc = await LearnerCourses.findOne({
    userId: userId.toString(),
    'courses.courseId': courseId.toString(),
  }).lean();
  return !!doc;
}

/**
 * Fetch stored progress for a user/course and compute the overall percentage.
 * Returns a default "no progress" shape when no document exists yet.
 * @param {string} userId
 * @param {string} courseId
 * @returns {Promise<object>}
 */
async function fetchProgress(userId, courseId) {
  const progress = await CourseProgress.findOne({ userId, courseId }).lean();
  if (!progress) {
    return { courseId, chapterProgress: [], overallPercentage: 0, completed: false };
  }

  const chapterProgress = progress.chapterProgress || [];
  const completedCount = chapterProgress.filter((c) => c.completed).length;
  const overallPercentage =
    chapterProgress.length > 0
      ? Math.round((completedCount / chapterProgress.length) * 100)
      : 0;

  return {
    courseId: progress.courseId,
    chapterProgress,
    overallPercentage,
    completed: !!progress.completed,
  };
}

/**
 * Upsert a single chapter's progress entry within a course document.
 * Completion is determined server-side (watchedPercentage >= threshold)
 * to prevent client-side cheating.
 *
 * @param {string} userId
 * @param {{ courseId, chapterId, currentTime, duration, watchedPercentage }} params
 * @returns {Promise<object>} The saved chapter entry
 */
async function saveProgress(userId, { courseId, chapterId, currentTime, duration, watchedPercentage }) {
  const safePercentage = Math.min(100, Math.max(0, Number(watchedPercentage) || 0));
  const safeCurrentTime = Math.max(0, Number(currentTime) || 0);
  const safeDuration = Math.max(0, Number(duration) || 0);
  const completedByBackend = safeDuration > 0 && safePercentage >= COMPLETION_THRESHOLD;

  let progress = await CourseProgress.findOne({ userId, courseId });
  if (!progress) {
    progress = new CourseProgress({ userId, courseId, chapterProgress: [] });
  }

  const idx = progress.chapterProgress.findIndex((c) => c.chapterId === chapterId);
  const prev = idx >= 0 ? progress.chapterProgress[idx] : null;
  const wasCompleted = !!(prev && prev.completed);

  // Once a chapter is marked complete, do not regress completion or displayed
  // progress when the learner rewatches and pauses partway through.
  const mergedCompleted = wasCompleted || completedByBackend;
  const mergedWatchedPercentage = wasCompleted
    ? Math.max(100, Number(prev.watchedPercentage) || 0, safePercentage)
    : safePercentage;

  const entry = {
    chapterId,
    currentTime: safeCurrentTime,
    duration: safeDuration > 0 ? safeDuration : Math.max(0, Number(prev?.duration) || 0),
    watchedPercentage: mergedWatchedPercentage,
    completed: mergedCompleted,
    lastWatchedAt: new Date(),
  };

  if (idx >= 0) {
    progress.chapterProgress[idx] = entry;
  } else {
    progress.chapterProgress.push(entry);
  }

  const completedChapters = progress.chapterProgress.filter((c) => c.completed).length;
  const totalChapters = progress.chapterProgress.length;
  progress.completed = totalChapters > 0 && completedChapters === totalChapters;
  if (progress.completed) progress.completionDate = new Date();

  await progress.save();
  return entry;
}

module.exports = { isEnrolled, fetchProgress, saveProgress };
