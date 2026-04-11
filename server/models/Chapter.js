const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const ChapterSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  ...AuditFields,
  ...SoftDelete,
});

module.exports = mongoose.model("Chapter", ChapterSchema);
