const Course = require("../models/Course");
const Chapter = require("../models/Chapter");

/**
 * Fetch a slim course document suitable for the learner watch-page sidebar.
 * Sections and chapters are populated; each chapter includes lightweight
 * `contents` with `_id`, `type`, `duration`, `metadata` (no bunnyVideoId / URLs)
 * so the client can show per-lesson lengths and quiz settings before full chapter load.
 *
 * @param {string} courseId
 * @returns {Promise<object|null>}
 */
async function getCourseOverview(courseId) {
  const course = await Course.findById(courseId)
    .populate("createdBy", "userName enrollmentData")
    .populate({
      path: "sections",
      match: { isDeleted: false },
      populate: {
        path: "chapters",
        match: { isDeleted: false },
        select: "_id title order description section",
        populate: {
          path: "contents",
          match: { isDeleted: false },
          select: "_id type duration order metadata",
        },
      },
    })
    .lean();

  if (!course || course.isDeleted) return null;
  return course;
}

/**
 * Fetch a full chapter document with its contents populated.
 * Video contents never include bunnyVideoId; the client must call GET /api/videos/:videoId/play
 * to obtain a signed playback URL. This prevents direct video URL exposure.
 *
 * @param {string} chapterId
 * @returns {Promise<object|null>}
 */
async function getChapterWithContent(chapterId) {
  const chapter = await Chapter.findById(chapterId)
    .populate({ path: "contents", match: { isDeleted: false } })
    .lean();

  if (!chapter) return null;

  if (Array.isArray(chapter.contents)) {
    chapter.contents = chapter.contents.map((content) => {
      if (content.type === "video") {
        const { bunnyVideoId, ...rest } = content;
        return rest;
      }
      if (content.type === "quiz" && Array.isArray(content.questions)) {
        return {
          ...content,
          questions: content.questions.map((q) => {
            const { correctAnswer, correctAnswers, ...restQ } = q;
            return restQ;
          }),
        };
      }
      return content;
    });
  }

  return chapter;
}

module.exports = { getCourseOverview, getChapterWithContent };
