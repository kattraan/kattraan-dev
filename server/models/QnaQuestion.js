const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");
const SoftDelete = require("./shared/SoftDelete");

const QnaReplySchema = new mongoose.Schema(
  {
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const QnaQuestionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["open", "answered", "closed"],
    default: "open",
  },
  replies: { type: [QnaReplySchema], default: [] },
  ...AuditFields,
  ...SoftDelete,
});

QnaQuestionSchema.index({ course: 1, chapter: 1, createdAt: -1 });

module.exports = mongoose.model("QnaQuestion", QnaQuestionSchema);

