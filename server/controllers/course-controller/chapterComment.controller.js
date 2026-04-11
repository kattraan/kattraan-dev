const ChapterComment = require("../../models/ChapterComment");

exports.getComments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    if (req.query.chapter) filter.chapter = req.query.chapter;
    if (req.query.status === 'read') filter.isRead = true;
    if (req.query.status === 'unread') filter.isRead = false;

    const items = await ChapterComment.find(filter)
      .populate("user", "userName userEmail")
      .populate("course", "title")
      .populate("chapter", "title")
      .populate("replies.user", "userName userEmail")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { course, chapter, text } = req.body;
    const comment = new ChapterComment({ course, chapter, user: userId, text: (text || "").trim() });
    await comment.save();

    const populated = await ChapterComment.findById(comment._id)
      .populate("user", "userName userEmail")
      .populate("course", "title")
      .populate("chapter", "title")
      .populate("replies.user", "userName userEmail");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: "Reply text is required." });
    }

    const comment = await ChapterComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

    comment.replies.push({ user: userId, text: String(text).trim() });
    await comment.save();

    const populated = await ChapterComment.findById(comment._id)
      .populate("user", "userName userEmail")
      .populate("course", "title")
      .populate("chapter", "title")
      .populate("replies.user", "userName userEmail");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await ChapterComment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });
    res.json({ success: true, message: "Comment deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await ChapterComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

    if (req.body.isRead !== undefined) comment.isRead = Boolean(req.body.isRead);
    await comment.save();

    const populated = await ChapterComment.findById(comment._id)
      .populate("user", "userName userEmail")
      .populate("course", "title")
      .populate("chapter", "title")
      .populate("replies.user", "userName userEmail");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const comment = await ChapterComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });
    const replyId = req.params.replyId;
    const initialLength = comment.replies.length;
    comment.replies = comment.replies.filter((r) => String(r._id) !== String(replyId));
    if (comment.replies.length === initialLength) {
      return res.status(404).json({ success: false, message: "Reply not found." });
    }
    await comment.save();

    const populated = await ChapterComment.findById(comment._id)
      .populate("user", "userName userEmail")
      .populate("course", "title")
      .populate("chapter", "title")
      .populate("replies.user", "userName userEmail");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
