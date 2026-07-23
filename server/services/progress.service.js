const CourseProgress = require('../models/CourseProgress');
const LearnerCourses = require('../models/LearnerCourses');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const certificateService = require('./certificate.service');

const COMPLETION_THRESHOLD = 90;
/** Max playback speed we tolerate between syncs (covers 2x speed + network jitter). */
const MAX_PLAYBACK_RATE_TOLERANCE = 2.5;
/** Extra seconds allowed on each progress sync interval. */
const SYNC_GRACE_SECONDS = 5;

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
 * Derive watched percentage from max watched time (never trust client % or scrub position).
 */
function deriveWatchedPercentage(maxWatchedTime, duration) {
  const safeMaxWatched = Math.max(0, Number(maxWatchedTime) || 0);
  const safeDuration = Math.max(0, Number(duration) || 0);
  if (safeDuration <= 0) return { percentage: 0, maxWatchedTime: safeMaxWatched, duration: safeDuration };
  const percentage = Math.min(100, Math.max(0, (safeMaxWatched / safeDuration) * 100));
  return { percentage, maxWatchedTime: safeMaxWatched, duration: safeDuration };
}

/**
 * Compute the furthest time a learner may legitimately reach since the last sync.
 * Prevents scrub-to-end cheats while allowing 2x speed and normal sync intervals.
 */
function computeAllowedMaxTime(prevMaxWatchedTime, lastWatchedAt, now) {
  const prevMax = Math.max(0, Number(prevMaxWatchedTime) || 0);
  if (!lastWatchedAt) return prevMax + SYNC_GRACE_SECONDS;
  const elapsedSec = Math.max(0, (now.getTime() - new Date(lastWatchedAt).getTime()) / 1000);
  return prevMax + elapsedSec * MAX_PLAYBACK_RATE_TOLERANCE + SYNC_GRACE_SECONDS;
}

/**
 * Advance maxWatchedTime only when the reported position is within allowed bounds.
 */
function mergeMaxWatchedTime(prev, requestedTime, duration, now) {
  const prevMax = Math.max(0, Number(prev?.maxWatchedTime ?? prev?.currentTime) || 0);
  const safeRequested = Math.max(0, Number(requestedTime) || 0);
  const safeDuration = Math.max(0, Number(duration) || 0);

  if (!prev) {
    const FIRST_SYNC_CAP = 15;
    if (safeDuration > 0 && safeRequested >= safeDuration - 0.5 && safeDuration <= FIRST_SYNC_CAP) {
      return safeDuration;
    }
    return Math.min(safeRequested, FIRST_SYNC_CAP);
  }

  const allowedMax = computeAllowedMaxTime(prevMax, prev.lastWatchedAt, now);
  if (safeRequested <= allowedMax) {
    return Math.max(prevMax, safeRequested);
  }
  return prevMax;
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

  const safeCurrentTime = Math.max(0, Number(currentTime) || 0);
  const safeDuration = Math.max(0, Number(duration) || 0);
  const now = new Date();

  let progress = await CourseProgress.findOne({ userId, courseId });
  if (!progress) {
    progress = new CourseProgress({ userId, courseId, chapterProgress: [] });
  }

  const idx = progress.chapterProgress.findIndex((c) => c.chapterId === chapterId);
  const prev = idx >= 0 ? progress.chapterProgress[idx] : null;
  const wasCompleted = !!(prev && prev.completed);

  const mergedMaxWatchedTime = wasCompleted
    ? Math.max(
        Number(prev?.maxWatchedTime ?? prev?.currentTime) || 0,
        safeDuration > 0 ? safeDuration : safeCurrentTime,
      )
    : mergeMaxWatchedTime(prev, safeCurrentTime, safeDuration, now);

  const { percentage } = deriveWatchedPercentage(mergedMaxWatchedTime, safeDuration);
  const completedByBackend = safeDuration > 0 && percentage >= COMPLETION_THRESHOLD;

  // Once complete, do not regress when the learner rewatches and pauses early.
  const mergedCompleted = wasCompleted || completedByBackend;
  const mergedWatchedPercentage = wasCompleted
    ? Math.max(100, Number(prev.watchedPercentage) || 0, percentage)
    : percentage;

  const entry = {
    chapterId,
    currentTime: safeCurrentTime,
    maxWatchedTime: mergedMaxWatchedTime,
    duration: safeDuration > 0 ? safeDuration : Math.max(0, Number(prev?.duration) || 0),
    watchedPercentage: mergedWatchedPercentage,
    completed: mergedCompleted,
    lastWatchedAt: now,
  };

  if (idx >= 0) {
    progress.chapterProgress[idx] = entry;
  } else {
    progress.chapterProgress.push(entry);
  }

  const totalChapters = await countCurriculumChapters(courseId);
  const completedChapters = progress.chapterProgress.filter((c) => c.completed).length;
  const wasCourseCompleted = !!progress.completed;
  progress.completed = totalChapters > 0 && completedChapters >= totalChapters;
  if (progress.completed) {
    progress.completionDate = progress.completionDate || new Date();
  }

  await progress.save();

  if (progress.completed && !wasCourseCompleted) {
    certificateService.issueCertificate(userId, courseId).catch((err) => {
      console.error('Certificate auto-issue failed:', err.message);
    });
  }

  return entry;
}

module.exports = {
  isEnrolled,
  fetchProgress,
  saveProgress,
  countCurriculumChapters,
  isChapterInCourse,
  deriveWatchedPercentage,
  mergeMaxWatchedTime,
  computeAllowedMaxTime,
  COMPLETION_THRESHOLD,
};
