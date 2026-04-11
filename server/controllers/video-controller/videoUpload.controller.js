/**
 * Video upload flow: create (Bunny + TUS credentials) and save (metadata to DB).
 * Backend does NOT receive or process video files.
 */
const VideoContent = require('../../models/VideoContent');
const Chapter = require('../../models/Chapter');
const { createVideoAndGetUploadCredentials } = require('../../services/bunnyService');

/** Strip bunnyVideoId from response when needed for internal use; play URL via GET /api/videos/:videoId/play */
function sanitizeVideo(video) {
  if (!video || video.type !== 'video') return video;
  const obj = video.toObject ? video.toObject() : video;
  const { bunnyVideoId, ...rest } = obj;
  return rest;
}

/**
 * POST /api/videos/create
 * Create Bunny Stream video entry and return TUS upload credentials.
 * Client uploads file directly to Bunny using these credentials.
 */
async function createVideo(req, res) {
  try {
    const title = (req.body?.title && String(req.body.title).trim()) || 'Untitled Video';
    const credentials = await createVideoAndGetUploadCredentials(title);
    return res.json({
      success: true,
      videoId: credentials.videoId,
      uploadUrl: credentials.uploadUrl,
      libraryId: credentials.libraryId,
      expirationTime: credentials.expirationTime,
      signature: credentials.signature,
    });
  } catch (err) {
    console.error('Video create error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create video',
    });
  }
}

/**
 * POST /api/videos/save
 * Save video metadata to DB after client has uploaded file to Bunny.
 * Creates VideoContent and links to chapter.
 */
async function saveVideoMetadata(req, res) {
  try {
    const { title, description, bunnyVideoId, duration, chapterId, courseId, fileName, fileSize } = req.body || {};

    if (!bunnyVideoId || typeof bunnyVideoId !== 'string' || !bunnyVideoId.trim()) {
      return res.status(400).json({ success: false, message: 'bunnyVideoId is required' });
    }
    if (!chapterId) {
      return res.status(400).json({ success: false, message: 'chapterId is required' });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const meta = {};
    if (fileName != null && String(fileName).trim()) meta.fileName = String(fileName).trim();
    if (typeof fileSize === 'number' && fileSize >= 0) meta.fileSize = fileSize;

    const video = new VideoContent({
      chapter: chapterId,
      type: 'video',
      title: (title && String(title).trim()) || 'Untitled Video',
      description: description ? String(description).trim() : undefined,
      bunnyVideoId: bunnyVideoId.trim(),
      duration: typeof duration === 'number' && duration >= 0 ? duration : undefined,
      encodingStatus: 'processing',
      ...(Object.keys(meta).length ? { metadata: meta } : {}),
    });
    await video.save();

    await Chapter.findByIdAndUpdate(chapterId, { $push: { contents: video._id } });

    return res.status(201).json({
      success: true,
      data: sanitizeVideo(video),
    });
  } catch (err) {
    console.error('Video save error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to save video metadata',
    });
  }
}

module.exports = {
  createVideo,
  saveVideoMetadata,
};
