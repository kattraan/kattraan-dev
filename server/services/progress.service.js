const CourseProgress = require('../models/CourseProgress');
const LearnerCourses = require('../models/LearnerCourses');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');

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
 * Count non-deleted chapters in the course curriculum (via sections).
 * @param {string} courseId
 * @returns {Promise<number>}
 */
async function countCurriculumChapters(courseId) {
  const course = await Course.findById(courseId).select('sections').lean();
  const sectionIds = (course?.sections || []).map((s) => s && s.toString()).filter(Boolean);
  if (!sectionIds.length) return 0;
  return Chapter.countDocuments({
    section: { $in: sectionIds },
    isDeleted: { $ne: true },
  });
}

async function isChapterInCourse(courseId, chapterId) {
  const course = await Course.findById(courseId).select('sections').lean();
  const sectionIds = (course?.sections || []).map((s) => s && s.toString()).filter(Boolean);
  if (!sectionIds.length) return false;
  const chapter = await Chapter.exists({
    _id: chapterId,
    section: { $in: sectionIds },
    isDeleted: { $ne: true },
  });
  return !!chapter;
}

/**
 * Derive watched percentage from playback position only (never trust client %).
 */
function deriveWatchedPercentage(currentTime, duration) {
  const safeCurrentTime = Math.max(0, Number(currentTime) || 0);
  const safeDuration = Math.max(0, Number(duration) || 0);
  if (safeDuration <= 0) return { percentage: 0, currentTime: safeCurrentTime, duration: safeDuration };
  const percentage = Math.min(100, Math.max(0, (safeCurrentTime / safeDuration) * 100));
  return { percentage, currentTime: safeCurrentTime, duration: safeDuration };
}

/**
 * Fetch stored progress for a user/course and compute the overall percentage
 * against the full curriculum size (not just chapters that have progress rows).
 */
async function fetchProgress(userId, courseId) {
  const progress = await CourseProgress.findOne({ userId, courseId }).lean();
  const totalChapters = await countCurriculumChapters(courseId);

  if (!progress) {
    return {
      courseId,
      chapterProgress: [],
      overallPercentage: 0,
      completed: false,
      totalChapters,
      completedChapters: 0,
    };
  }

  const chapterProgress = progress.chapterProgress || [];
  const completedCount = chapterProgress.filter((c) => c.completed).length;
  const overallPercentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const completed = totalChapters > 0 && completedCount >= totalChapters;

  return {
    courseId: progress.courseId,
    chapterProgress,
    overallPercentage,
    completed,
    totalChapters,
    completedChapters: completedCount,
  };
}

/**
 * Upsert a single chapter's progress entry within a course document.
 * Completion is derived from currentTime/duration on the server.
 *
 * @param {string} userId
 * @param {{ courseId, chapterId, currentTime, duration }} params
 * @returns {Promise<object>} The saved chapter entry
 */
async function saveProgress(userId, { courseId, chapterId, currentTime, duration }) {
  const belongsToCourse = await isChapterInCourse(courseId, chapterId);
  if (!belongsToCourse) {
    const err = new Error('Chapter does not belong to this course');
    err.statusCode = 400;
    throw err;
  }

  const { percentage, currentTime: safeCurrentTime, duration: safeDuration } =
    deriveWatchedPercentage(currentTime, duration);
  const completedByBackend = safeDuration > 0 && percentage >= COMPLETION_THRESHOLD;

  let progress = await CourseProgress.findOne({ userId, courseId });
  if (!progress) {
    progress = new CourseProgress({ userId, courseId, chapterProgress: [] });
  }

  const idx = progress.chapterProgress.findIndex((c) => c.chapterId === chapterId);
  const prev = idx >= 0 ? progress.chapterProgress[idx] : null;
  const wasCompleted = !!(prev && prev.completed);

  // Once complete, do not regress when the learner rewatches and pauses early.
  const mergedCompleted = wasCompleted || completedByBackend;
  const mergedWatchedPercentage = wasCompleted
    ? Math.max(100, Number(prev.watchedPercentage) || 0, percentage)
    : percentage;

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

  const totalChapters = await countCurriculumChapters(courseId);
  const completedChapters = progress.chapterProgress.filter((c) => c.completed).length;
  progress.completed = totalChapters > 0 && completedChapters >= totalChapters;
  if (progress.completed) {
    progress.completionDate = progress.completionDate || new Date();
  }

  await progress.save();
  return entry;
}

module.exports = {
  isEnrolled,
  fetchProgress,
  saveProgress,
  countCurriculumChapters,
  isChapterInCourse,
  deriveWatchedPercentage,
  COMPLETION_THRESHOLD,
};
