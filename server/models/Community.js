const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const CommunitySchema = new mongoose.Schema({
  // Uniqueness for active communities only — archived (soft-deleted) rows must not block recreate.
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: "" },
  avatar: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  ...AuditFields,
  ...SoftDelete,
});

CommunitySchema.index(
  { course: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false }, name: "course_active_unique" },
);

module.exports = mongoose.model("Community", CommunitySchema);
