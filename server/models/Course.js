const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String },
  description: { type: String },
  thumbnail: { type: String }, // course cover image
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  category: { type: String, trim: true, default: "" },
  language: { type: String, default: "en" },
  price: { type: Number, default: 0 },         // Always stored in INR
  currency: { type: String, default: 'INR' },  // Base currency (always INR)
  discount: { type: Number, default: 0, min: 0, max: 100 }, // optional discount percentage
  status: {
    type: String,
    enum: ["draft", "pending_approval", "published", "rejected"],
    default: "draft",
  },
  submittedForReviewAt: { type: Date },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dripType: { type: String, default: "No drip" },
  visibility: { type: String, enum: ["public", "private"], default: "private" }, // intent: listed publicly vs by link only
  chapters: { type: Array, default: [] },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseReview" }],
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseVersion" }],
  duration: { type: Number, default: null }, // total duration in minutes (optional, for display on cards)
  learners: { type: Number, default: 0 }, // enrolled count (can be updated on enroll or computed)
  /** Instructor-pasted Meet/Zoom links + schedule (v1 — no external API). */
  liveSessions: [
    {
      title: { type: String, trim: true, default: "" },
      meetingUrl: { type: String, trim: true, required: true },
      scheduledAt: { type: Date, required: true },
      /** End of session window; join link works until this time. */
      scheduledEnd: { type: Date },
      durationMinutes: { type: Number, default: 60, min: 5, max: 480 },
    },
  ],
  chapterEngagementTemplates: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "", trim: true },
      labels: {
        type: [String],
        default: [
          "Totally lost",
          "Very confusing",
          "Partly clear",
          "Mostly clear",
          "Crystal clear",
        ],
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  ...AuditFields,
  ...SoftDelete,
});

CourseSchema.index({ status: 1 });

module.exports = mongoose.model("Course", CourseSchema);
