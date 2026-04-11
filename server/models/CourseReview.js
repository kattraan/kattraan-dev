const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");

const CourseReviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  pinned: { type: Boolean, default: false },
  instructorReply: {
    message: { type: String, trim: true, maxlength: 2000 },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    instructorName: { type: String, trim: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  ...AuditFields,
});

CourseReviewSchema.index({ course: 1, user: 1 }, { unique: true });

/** Bump updatedAt on every save of an existing doc (AuditFields do not auto-update). */
CourseReviewSchema.pre("save", function reviewTouchUpdatedAt(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("CourseReview", CourseReviewSchema);
