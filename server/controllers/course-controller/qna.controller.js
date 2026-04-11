const QnaQuestion = require("../../models/QnaQuestion");

exports.getQuestions = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.course) filter.course = req.query.course;
    if (req.query.chapter) filter.chapter = req.query.chapter;

    const items = await QnaQuestion.find(filter)
      .populate("askedBy", "userName userEmail")
      .populate("chapter", "title")
      .populate("replies.repliedBy", "userName userEmail")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      askedBy: req.user && req.user.id ? req.user.id : req.user?._id,
    };

    const question = new QnaQuestion(payload);
    await question.save();

    const populated = await question.populate([
      { path: "askedBy", select: "userName userEmail" },
      { path: "chapter", select: "title" },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const updated = await QnaQuestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("askedBy", "userName userEmail")
      .populate("chapter", "title");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const userId = req.user && req.user.id ? req.user.id : req.user?._id;
    const { body } = req.body;
    if (!body || typeof body !== "string" || !body.trim()) {
      return res.status(400).json({ success: false, message: "Reply body is required." });
    }

    const question = await QnaQuestion.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    question.replies.push({
      repliedBy: userId,
      body: body.trim(),
    });
    question.status = "answered";
    await question.save();

    const populated = await QnaQuestion.findById(question._id)
      .populate("askedBy", "userName userEmail")
      .populate("chapter", "title")
      .populate("replies.repliedBy", "userName userEmail");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await QnaQuestion.findOne({ _id: req.params.id, isDeleted: false });
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    question.isDeleted = true;
    question.deletedAt = new Date();
    await question.save();
    res.json({ success: true, message: "Question removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const question = await QnaQuestion.findOne({ _id: req.params.id, isDeleted: false });
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    const replyId = req.params.replyId;
    const initialLength = question.replies.length;
    question.replies = question.replies.filter(
      (r) => String(r._id) !== String(replyId)
    );
    if (question.replies.length === initialLength) {
      return res.status(404).json({ success: false, message: "Reply not found." });
    }
    if (question.replies.length === 0) {
      question.status = "open";
    }
    await question.save();

    const populated = await QnaQuestion.findById(question._id)
      .populate("askedBy", "userName userEmail")
      .populate("chapter", "title")
      .populate("replies.repliedBy", "userName userEmail");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

