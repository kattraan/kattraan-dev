const crypto = require('crypto');
const VideoContent = require('../../models/VideoContent');
const { getBunnyVideo } = require('../../helpers/bunnyStream');

const STATUS_FINISHED = 3;
const STATUS_RESOLUTION_FINISHED = 4;
const STATUS_FAILED = 5;

function getLibraryId() {
  return (process.env.BUNNY_LIBRARY_ID || '').trim();
}

function getWebhookSecret() {
  /**
   * Bunny signs webhooks with HMAC-SHA256 using the library Read-Only API key.
   * Prefer BUNNY_STREAM_WEBHOOK_SECRET; fall back to BUNNY_API_KEY if unset.
   * @see https://docs.bunny.net/stream/webhooks
   */
  return (
    process.env.BUNNY_STREAM_WEBHOOK_SECRET ||
    process.env.BUNNY_API_KEY ||
    ''
  ).trim();
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * Verify Bunny Stream webhook signature (v1 / hmac-sha256 / lowercase hex).
 */
function verifyBunnyWebhookSignature(rawBody, headers = {}) {
  const signature = String(
    headers['x-bunnystream-signature'] ||
      headers['X-BunnyStream-Signature'] ||
      '',
  ).trim().toLowerCase();
  const version = String(
    headers['x-bunnystream-signature-version'] ||
      headers['X-BunnyStream-Signature-Version'] ||
      '',
  ).trim().toLowerCase();
  const algorithm = String(
    headers['x-bunnystream-signature-algorithm'] ||
      headers['X-BunnyStream-Signature-Algorithm'] ||
      '',
  ).trim().toLowerCase();

  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    const err = new Error('Bunny webhook signing secret is not configured');
    err.statusCode = 500;
    throw err;
  }
  if (!signature || !rawBody) {
    const err = new Error('Missing Bunny webhook signature');
    err.statusCode = 401;
    throw err;
  }
  if (version && version !== 'v1') {
    const err = new Error('Unsupported Bunny webhook signature version');
    err.statusCode = 401;
    throw err;
  }
  if (algorithm && algorithm !== 'hmac-sha256') {
    const err = new Error('Unsupported Bunny webhook signature algorithm');
    err.statusCode = 401;
    throw err;
  }

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(String(rawBody), 'utf8')
    .digest('hex');

  if (!timingSafeEqualHex(expected, signature)) {
    const err = new Error('Invalid Bunny webhook signature');
    err.statusCode = 401;
    throw err;
  }
}

/**
 * POST /api/webhooks/bunny-stream
 * Body: { VideoLibraryId, VideoGuid, Status }
 */
async function handleBunnyStreamWebhook(req, res) {
  try {
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req.rawBody)
          ? req.rawBody.toString('utf8')
          : '';

    try {
      verifyBunnyWebhookSignature(rawBody, req.headers);
    } catch (verifyErr) {
      const status = verifyErr.statusCode || 401;
      console.error('[Bunny webhook] signature verification failed:', verifyErr.message);
      return res.status(status).json({ success: false, message: verifyErr.message });
    }

    const { VideoLibraryId, VideoGuid, Status } = req.body || {};

    if (!VideoGuid || typeof VideoGuid !== 'string') {
      return res.status(400).json({ success: false, message: 'VideoGuid required' });
    }

    const ourLibraryId = getLibraryId().replace(/\s/g, '');
    if (!ourLibraryId) {
      console.error('[Bunny webhook] BUNNY_LIBRARY_ID is not configured');
      return res.status(500).json({ success: false, message: 'Library ID not configured' });
    }
    const incomingId = String(VideoLibraryId ?? '').trim();
    if (!incomingId || String(ourLibraryId) !== String(incomingId)) {
      return res.status(403).json({ success: false, message: 'Library ID mismatch' });
    }

    const videoContent = await VideoContent.findOne({
      bunnyVideoId: VideoGuid.trim(),
      isDeleted: { $ne: true },
    });
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

module.exports = { handleBunnyStreamWebhook, verifyBunnyWebhookSignature };
