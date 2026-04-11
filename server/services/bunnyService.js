/**
 * Bunny Stream service: create video + TUS presigned credentials for direct client upload.
 * Backend never receives the video file; client uploads directly to Bunny TUS endpoint.
 */
const crypto = require('crypto');
const { createBunnyVideo } = require('../helpers/bunnyStream');

const LIBRARY_ID = (process.env.BUNNY_LIBRARY_ID || '').trim();
const API_KEY = (process.env.BUNNY_API_KEY || '').trim();

const BUNNY_TUS_UPLOAD_URL = 'https://video.bunnycdn.com/tusupload';

/** Default TUS upload expiry: 24 hours (seconds). */
const TUS_EXPIRY_SECONDS = 86400;

/**
 * Create a video object in Bunny Stream and return TUS upload credentials.
 * Used by POST /api/videos/create. Client will upload file directly to Bunny TUS.
 *
 * @param {string} title - Video title (required by Bunny)
 * @returns {Promise<{ videoId: string, uploadUrl: string, libraryId: string, expirationTime: number, signature: string }>}
 */
async function createVideoAndGetUploadCredentials(title) {
  if (!LIBRARY_ID || !API_KEY) {
    throw new Error('Bunny Stream: BUNNY_LIBRARY_ID and BUNNY_API_KEY must be set.');
  }

  const trimmedTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Untitled Video';
  const videoId = await createBunnyVideo(trimmedTitle);

  const expirationTime = Math.floor(Date.now() / 1000) + TUS_EXPIRY_SECONDS;
  const signatureString = `${LIBRARY_ID}${API_KEY}${expirationTime}${videoId}`;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

  return {
    videoId,
    uploadUrl: BUNNY_TUS_UPLOAD_URL,
    libraryId: LIBRARY_ID,
    expirationTime,
    signature,
  };
}

module.exports = {
  createVideoAndGetUploadCredentials,
  BUNNY_TUS_UPLOAD_URL,
};
