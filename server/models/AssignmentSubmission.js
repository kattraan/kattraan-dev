const mongoose = require("mongoose");

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    status: {
      type: String,
      enum: ["draft", "submitted", "graded"],
      default: "submitted",
    },
    submittedAt: { type: Date, default: Date.now },
    submissionText: { type: String },
    submissionFileUrl: { type: String },
    attemptCount: { type: Number, default: 0 },
    latestEvaluation: { type: Object, default: null },
    passed: { type: Boolean, default: false },
    grade: { type: Number },
    instructorFeedback: { type: String },
    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AssignmentSubmissionSchema.index({ user: 1, content: 1 }, { unique: true });
AssignmentSubmissionSchema.index({ course: 1 });
AssignmentSubmissionSchema.index({ content: 1 });

module.exports = mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
