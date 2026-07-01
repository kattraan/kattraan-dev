const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const CommunitySchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  ...AuditFields,
  ...SoftDelete,
});

module.exports = mongoose.model("Community", CommunitySchema);
