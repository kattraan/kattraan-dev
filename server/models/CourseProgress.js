const mongoose = require("mongoose");

const LectureProgressSchema = new mongoose.Schema({
  lectureId: String,
  viewed: Boolean,
  dateViewed: Date,
});

/** Per-chapter watch progress for LMS (resume, completion, anti-cheat). */
const ChapterProgressSchema = new mongoose.Schema({
  chapterId: { type: String, required: true },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  watchedPercentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now },
}, { _id: false });

const CourseProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  completed: Boolean,
  completionDate: Date,
  lecturesProgress: [LectureProgressSchema],
  chapterProgress: [ChapterProgressSchema],
}, { timestamps: true });

CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", CourseProgressSchema);
