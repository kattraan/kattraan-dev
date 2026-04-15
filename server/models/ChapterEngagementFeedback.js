const mongoose = require("mongoose");

const ChapterEngagementFeedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    label: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

ChapterEngagementFeedbackSchema.index(
  { courseId: 1, contentId: 1, userId: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "ChapterEngagementFeedback",
  ChapterEngagementFeedbackSchema,
);
