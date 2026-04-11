const mongoose = require("mongoose");
const AuditFields = require("./shared/AuditFields");

const CommentSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  ...AuditFields,
});

module.exports = mongoose.model("Comment", CommentSchema);
