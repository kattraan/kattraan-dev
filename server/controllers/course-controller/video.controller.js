// controllers/course-controller/video.controller.js
const VideoContent = require("../../models/VideoContent");
const Chapter = require("../../models/Chapter");

/** Strip bunnyVideoId from video so client never receives it; playback via GET /api/videos/:videoId/play */
function sanitizeVideoForClient(video) {
  if (!video || video.type !== "video") return video;
  const { bunnyVideoId, ...rest } = video.toObject ? video.toObject() : video;
  return rest;
}

// Get all video contents (optionally by chapter)
exports.getAllVideoContents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.chapter) filter.chapter = req.query.chapter;
    const videos = await VideoContent.find(filter);
    res.json({ success: true, data: videos.map(sanitizeVideoForClient) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get video content by ID
exports.getVideoContentById = async (req, res) => {
  try {
    const video = await VideoContent.findById(req.params.id);
    if (!video)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: sanitizeVideoForClient(video) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create video content AND push to chapter
exports.createVideoContent = async (req, res) => {
  try {
    const video = new VideoContent(req.body);
    await video.save();

    // Push content reference into parent chapter
    if (req.body.chapter) {
      await Chapter.findByIdAndUpdate(req.body.chapter, {
        $push: { contents: video._id },
      });
    }

    // Notify enrolled learners (fire-and-forget)
    const notificationService = require('../../services/notification.service');
    notificationService
      .notifyCourseVideoAdded({
        courseId: req.body.courseId || req.body.course || undefined,
        chapterId: req.body.chapter,
        videoTitle: video.title,
        videoId: video._id,
        excludeUserId: req.user?._id,
      })
      .catch((e) => console.error('[createVideoContent] notification', e.message || e));

    res
      .status(201)
      .json({ success: true, data: sanitizeVideoForClient(video) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Video upload: use direct TUS to Bunny via POST /api/videos/create → client upload → POST /api/videos/save

// Update video content
exports.updateVideoContent = async (req, res) => {
  try {
    const video = await VideoContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!video)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: sanitizeVideoForClient(video) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete video content (soft-delete) AND remove from chapter
exports.deleteVideoContent = async (req, res) => {
  try {
    const video = await VideoContent.findById(req.params.id);
    if (!video || video.isDeleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    video.isDeleted = true;
    video.deletedAt = new Date();
    if (req.user?._id) video.deletedBy = String(req.user._id);
    await video.save();

    if (video.chapter) {
      await Chapter.findByIdAndUpdate(video.chapter, {
        $pull: { contents: video._id },
      });
    }

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
