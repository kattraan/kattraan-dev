const mongoose = require("mongoose");

const CommentReplySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ChapterCommentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true },
  replies: { type: [CommentReplySchema], default: [] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

ChapterCommentSchema.index({ course: 1, chapter: 1, createdAt: -1 });

module.exports = mongoose.model("ChapterComment", ChapterCommentSchema);
