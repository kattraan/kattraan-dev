const mongoose = require("mongoose");
const AuditFields = require("./_shared/AuditFields");

const CourseVersionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  version: { type: String, required: true },
  changes: { type: String }, // changelog / notes
  releasedAt: { type: Date, default: Date.now },
  ...AuditFields,
});

module.exports = mongoose.model("CourseVersion", CourseVersionSchema);
