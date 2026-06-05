const Chapter = require('../models/Chapter');
const Section = require('../models/Section');
const Content = require('../models/Content');
const Course = require('../models/Course');
const LearnerCourses = require('../models/LearnerCourses');
const { generateSignedStreamUrl, generateSignedUrl } = require('../helpers/bunnyToken');
const { getBunnyVideo } = require('../helpers/bunnyStream');

/** Bunny Stream status: 3 = finished, 4 = first resolution ready (playable). */
const BUNNY_PLAYABLE_STATUSES = new Set([3, 4]);

/** TTL for signed VOD playback URLs (1 hour). Short TTL + frequent client refresh caused full HLS reloads and resets mid-lesson. */
const PLAYBACK_URL_TTL = 3600;

/**
 * Resolve the parent courseId for a given chapterId by traversing
 * Chapter → Section → Course.
 * @param {string} chapterId
 * @returns {Promise<string|null>}
 */
async function getCourseIdFromChapter(chapterId) {
  const chapter = await Chapter.findById(chapterId).select('section').lean();
  if (!chapter) return null;
  const section = await Section.findById(chapter.section).select('course').lean();
  return section?.course?.toString() ?? null;
}

/**
 * Check whether a user is enrolled in a course or has an elevated role
 * that grants implicit access (instructor / admin).
 * @param {string} userId
 * @param {string} courseId
 * @param {string} [userRole]
 * @returns {Promise<boolean>}
 */
async function isEnrolledOrElevated(userId, courseId, userRole) {
  // Creator can always preview their own course, regardless of role token shape.
  const course = await Course.findById(courseId).select('createdBy').lean();
  if (course?.createdBy && String(course.createdBy) === String(userId)) return true;

  if (userRole === 'instructor' || userRole === 'admin') return true;
  const doc = await LearnerCourses.findOne({
    userId: userId.toString(),
    'courses.courseId': courseId.toString(),
  }).lean();
  return !!doc;
}

/**
 * Fetch a fresh signed Bunny Stream play URL for the first video content inside
 * the given chapter. Enrollment is verified before the URL is generated.
 *
 * @param {string} chapterId  - MongoDB chapter _id
 * @param {string} userId
 * @param {string} [userRole]
 * @returns {Promise<{signedUrl: string, contentId: string}|null>}
 *   null when no video found or user is not authorised
 */
async function getChapterPlayUrl(chapterId, userId, userRole) {
  const courseId = await getCourseIdFromChapter(chapterId);
  if (!courseId) return null;

  const authorized = await isEnrolledOrElevated(userId, courseId, userRole);
  if (!authorized) return null;

  const chapter = await Chapter.findById(chapterId)
    .populate({ path: 'contents', match: { isDeleted: false, type: 'video' } })
    .lean();
  if (!chapter) return null;

  const videoContent = chapter.contents?.[0];
  const signedUrl = await getSignedPlaybackUrlFromContent(videoContent);
  if (!signedUrl) return null;

  return { signedUrl, contentId: videoContent._id.toString() };
}

/**
 * Build signed playback URL from video content.
 * Primary path: Bunny Stream (bunnyVideoId).
 * Legacy fallback: direct videoUrl signed with CDN token (for pre-migration data).
 *
 * @param {object} content - Video content document (lean)
 * @returns {string|null} Signed playlist URL or null
 */
/**
 * Ensure the Bunny guid exists in the configured library and is playable.
 * @throws {Error} code BUNNY_VIDEO_NOT_FOUND | BUNNY_VIDEO_ENCODING
 */
async function assertBunnyVideoPlayable(bunnyVideoId) {
  const info = await getBunnyVideo(bunnyVideoId);
  if (!info) {
    const err = new Error(
      'This video is not available in your Bunny Stream library. It may still be uploading, was deleted, or belongs to an old Bunny account — re-upload the lesson video.'
    );
    err.code = 'BUNNY_VIDEO_NOT_FOUND';
    throw err;
  }
  if (info.status != null && !BUNNY_PLAYABLE_STATUSES.has(info.status)) {
    const err = new Error(
      'Video is still encoding on Bunny Stream. Wait until processing finishes, then try again.'
    );
    err.code = 'BUNNY_VIDEO_ENCODING';
    throw err;
  }
}

async function getSignedPlaybackUrlFromContent(content) {
  if (!content) return null;

  if (content.bunnyVideoId) {
    await assertBunnyVideoPlayable(content.bunnyVideoId);
    return generateSignedStreamUrl(content.bunnyVideoId, PLAYBACK_URL_TTL);
  }

  if (content.videoUrl) {
    // Legacy videos using direct MP4 or existing HLS URL.
    return generateSignedUrl(content.videoUrl, PLAYBACK_URL_TTL);
  }

  return null;
}

/**
 * Fetch video by content ID and return a signed Bunny Stream playback URL.
 * Verifies enrollment (or instructor/admin) before returning the URL.
 *
 * @param {string} videoId - Video content document _id
 * @param {string} userId
 * @param {string} [userRole]
 * @returns {Promise<{ playbackUrl: string }|null>} null if not found or not authorized
 */
async function getVideoPlayUrlByVideoId(videoId, userId, userRole) {
  const content = await Content.findById(videoId).lean();
  if (!content || content.type !== 'video') return null;

  const playbackUrl = await getSignedPlaybackUrlFromContent(content);
  if (!playbackUrl) return null;

  const chapterId = content.chapter?.toString?.() || content.chapter;
  if (!chapterId) return null;

  const courseId = await getCourseIdFromChapter(chapterId);
  if (!courseId) return null;

  const authorized = await isEnrolledOrElevated(userId, courseId, userRole);
  if (!authorized) return null;

  return { playbackUrl };
}

module.exports = {
  getCourseIdFromChapter,
  isEnrolledOrElevated,
  getChapterPlayUrl,
  getVideoPlayUrlByVideoId,
};
