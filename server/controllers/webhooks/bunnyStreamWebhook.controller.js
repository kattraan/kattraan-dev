const VideoContent = require('../../models/VideoContent');
const { getBunnyVideo } = require('../../helpers/bunnyStream');

const LIBRARY_ID = (process.env.BUNNY_LIBRARY_ID || '').trim();

/**
 * Bunny Stream webhook status codes (from docs):
 * 3 = Finished (encoding complete, video fully available)
 * 4 = Resolution finished (first resolution done, video playable)
 * 5 = Failed (encoding failed)
 */
const STATUS_FINISHED = 3;
const STATUS_RESOLUTION_FINISHED = 4;
const STATUS_FAILED = 5;

/**
 * POST /api/webhooks/bunny-stream
 *
 * Called by Bunny when video encoding status changes.
 * Body: { VideoLibraryId, VideoGuid, Status }
 *
 * - Validates VideoLibraryId matches our BUNNY_LIBRARY_ID (avoid spoofing).
 * - Finds VideoContent by bunnyVideoId = VideoGuid.
 * - Status 3 or 4 → encodingStatus = "ready", fetch duration/resolution from Bunny and save.
 * - Status 5 → encodingStatus = "failed".
 *
 * No auth: Bunny servers call this URL. We rely on library ID check.
 */
async function handleBunnyStreamWebhook(req, res) {
  try {
    const { VideoLibraryId, VideoGuid, Status } = req.body || {};

    if (!VideoGuid || typeof VideoGuid !== 'string') {
      return res.status(400).json({ success: false, message: 'VideoGuid required' });
    }

    const ourLibraryId = LIBRARY_ID.replace(/\s/g, '');
    const incomingId = String(VideoLibraryId ?? '').trim();
    if (ourLibraryId && incomingId && String(ourLibraryId) !== String(incomingId)) {
      return res.status(403).json({ success: false, message: 'Library ID mismatch' });
    }

    const videoContent = await VideoContent.findOne({ bunnyVideoId: VideoGuid.trim() });
    if (!videoContent) {
      return res.status(200).json({ success: true, message: 'Video not found in DB (ignored)' });
    }

    const statusCode = Number(Status);

    if (statusCode === STATUS_FAILED) {
      videoContent.encodingStatus = 'failed';
      await videoContent.save();
      return res.status(200).json({ success: true, encodingStatus: 'failed' });
    }

    if (statusCode === STATUS_FINISHED || statusCode === STATUS_RESOLUTION_FINISHED) {
      videoContent.encodingStatus = 'ready';

      const details = await getBunnyVideo(VideoGuid);
      if (details) {
        if (details.length > 0) videoContent.duration = details.length;
        if (details.resolution) videoContent.resolution = details.resolution;
      }

      await videoContent.save();
      return res.status(200).json({ success: true, encodingStatus: 'ready' });
    }

    return res.status(200).json({ success: true, message: 'Status acknowledged' });
  } catch (err) {
    console.error('Bunny Stream webhook error:', err);
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
}

module.exports = { handleBunnyStreamWebhook };
