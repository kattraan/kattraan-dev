const Course = require("../../models/Course");
const Chapter = require("../../models/Chapter");
const Content = require("../../models/Content");
const InstructorEngagementTemplate = require("../../models/InstructorEngagementTemplate");
const ChapterEngagementFeedback = require("../../models/ChapterEngagementFeedback");
const progressService = require("../../services/progress.service");

async function submitFeedback(req, res) {
  try {
    const userId = req.user?._id?.toString();
    const { courseId, chapterId, contentId, templateId, rating } = req.body || {};

    if (!courseId || !chapterId || !contentId || !templateId || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "courseId, chapterId, contentId, templateId and rating are required",
      });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "rating must be between 1 and 5" });
    }

    const enrolled = await progressService.isEnrolled(userId, courseId);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: "Access denied: not enrolled in this course",
      });
    }

    const [course, chapter, content] = await Promise.all([
      Course.findById(courseId).lean(),
      Chapter.findById(chapterId).lean(),
      Content.findById(contentId).lean(),
    ]);

    if (!course || course.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    if (!chapter || chapter.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }
    if (!content || content.isDeleted || String(content.type) !== "video") {
      return res
        .status(404)
        .json({ success: false, message: "Video content not found" });
    }

    if (String(content.chapter) !== String(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "contentId does not belong to the provided chapterId",
      });
    }

    const template = await InstructorEngagementTemplate.findOne({
      _id: templateId,
      createdBy: course.createdBy,
    }).lean();
    if (!template) {
      return res
        .status(400)
        .json({ success: false, message: "Template not found on this course" });
    }

    const label = template.labels?.[numericRating - 1] || "";

    const feedback = await ChapterEngagementFeedback.findOneAndUpdate(
      { courseId, chapterId, contentId, userId },
      {
        $set: {
          templateId,
          rating: numericRating,
          label,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).lean();

    return res.json({ success: true, data: feedback });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { submitFeedback };
