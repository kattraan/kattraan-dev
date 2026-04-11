const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const SectionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  dripDays: { type: Number, default: 0 },
  unlockDate: { type: Date },
  completionPercentage: { type: Number, default: 0 },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  ...AuditFields,
  ...SoftDelete,
});

module.exports = mongoose.model("Section", SectionSchema);
