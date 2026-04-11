const crypto = require('crypto');

// Bunny Stream signed URLs: BUNNY_TOKEN_KEY (or legacy BUNNY_TOKEN_AUTH_KEY), BUNNY_CDN_URL (or BUNNY_CDN_HOSTNAME)
const BUNNY_TOKEN_KEY = (process.env.BUNNY_TOKEN_KEY || process.env.BUNNY_TOKEN_AUTH_KEY || '').trim();
const CDN_HOST = (process.env.BUNNY_CDN_URL || process.env.BUNNY_CDN_HOSTNAME || '').trim();

/**
 * Generate a Bunny CDN signed URL with expiry-based token authentication.
 *
 * When BUNNY_TOKEN_AUTH_KEY is not set the original URL is returned unchanged
 * so the feature gracefully degrades during development without a token key.
 *
 * @see https://support.bunny.net/hc/en-us/articles/360016055099
 * @param {string} originalUrl - Full CDN URL, e.g. https://cdn.example.com/videos/foo.mp4
 * @param {number} [ttlSeconds=60] - Seconds until the signed URL expires (default 60)
 * @returns {string} Signed URL with `token` and `expires` query params
 */
function generateSignedUrl(originalUrl, ttlSeconds = 60) {
  if (!BUNNY_TOKEN_KEY || !originalUrl) return originalUrl;

  let urlObj;
  try {
    urlObj = new URL(originalUrl);
  } catch {
    return originalUrl;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = signPath(urlObj.pathname, expiresAt);
  return `${urlObj.origin}${urlObj.pathname}?token=${token}&expires=${expiresAt}`;
}

/**
 * Generate a signed Bunny CDN playback URL from a path and optional expiration.
 * Use for secure playback API; URLs expire quickly to prevent sharing.
 *
 * @param {string} videoPath - Path on the CDN (e.g. "videos/playlist.m3u8" or "/videos/playlist.m3u8")
 * @param {number} [expirationTime] - Unix timestamp when the URL expires; defaults to now + 60 seconds
 * @returns {string} Full signed URL: https://cdn.example.com/video/playlist.m3u8?token=HASH&expires=TIMESTAMP
 */
function generateSignedPlaybackUrl(videoPath, expirationTime) {
  if (!BUNNY_TOKEN_KEY) return '';

  const pathNormalized = String(videoPath).replace(/^\//, '');
  const pathForSign = pathNormalized.startsWith('/') ? pathNormalized : `/${pathNormalized}`;
  const expiresAt = expirationTime != null && expirationTime > 0
    ? Math.floor(Number(expirationTime))
    : Math.floor(Date.now() / 1000) + 60;

  const token = signPath(pathForSign, expiresAt);
  const base = CDN_HOST ? `https://${CDN_HOST.replace(/^https?:\/\//, '')}` : '';
  const pathPart = pathNormalized.startsWith('/') ? pathNormalized : `/${pathNormalized}`;
  return `${base}${pathPart}?token=${token}&expires=${expiresAt}`;
}

/**
 * Bunny Pull Zone token (Storage images/files). Use the token key from the **same** pull zone as BUNNY_CDN_HOSTNAME.
 * If unset, storage URLs are returned unsigned (pull zone must allow public access without token).
 */
const STORAGE_PULL_TOKEN = (process.env.BUNNY_STORAGE_PULL_ZONE_TOKEN_KEY || '').trim();
const STORAGE_CDN_HOST_RAW = (process.env.BUNNY_CDN_HOSTNAME || '').trim();

function storageCdnHostnameNormalized() {
  return STORAGE_CDN_HOST_RAW.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
}

/**
 * Bunny Token Authentication: SHA-256 hash of (TokenKey + path + expires), base64url-encoded.
 * @param {string} path - URL path (with leading slash)
 * @param {number} expiresAt - Unix timestamp
 * @param {string} [tokenKey] - optional; defaults to BUNNY_TOKEN_KEY (Stream / default CDN)
 * @returns {string}
 */
function signPathWithKey(path, expiresAt, tokenKey) {
  const key = tokenKey || BUNNY_TOKEN_KEY;
  if (!key) return '';
  const hashInput = key + path + expiresAt;
  return crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function signPath(path, expiresAt) {
  if (!BUNNY_TOKEN_KEY) return '';
  return signPathWithKey(path, expiresAt, BUNNY_TOKEN_KEY);
}

/**
 * Sign any Bunny Pull Zone URL (path-based token). Use STORAGE_PULL_TOKEN when it matches the URL host.
 * @param {string} originalUrl
 * @param {number} ttlSeconds
 * @param {string} tokenKey
 */
function generateSignedUrlWithKey(originalUrl, ttlSeconds, tokenKey) {
  if (!tokenKey || !originalUrl) return originalUrl;
  let urlObj;
  try {
    urlObj = new URL(originalUrl);
  } catch {
    return originalUrl;
  }
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = signPathWithKey(urlObj.pathname, expiresAt, tokenKey);
  return `${urlObj.origin}${urlObj.pathname}?token=${token}&expires=${expiresAt}`;
}

/**
 * If BUNNY_STORAGE_PULL_ZONE_TOKEN_KEY is set and the URL is on BUNNY_CDN_HOSTNAME, add token query params
 * so browsers can load images (cover thumbnails, etc.) from a token-protected pull zone.
 * Re-signing uses pathname only, so expired signed URLs in the DB still refresh correctly on read.
 */
function signStorageCdnUrl(url, ttlSeconds = 60 * 60 * 24 * 7) {
  if (!STORAGE_PULL_TOKEN || !url) return url;
  const cdnHost = storageCdnHostnameNormalized();
  if (!cdnHost) return url;
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }
  if (hostname !== cdnHost) return url;
  return generateSignedUrlWithKey(url, ttlSeconds, STORAGE_PULL_TOKEN);
}

/**
 * Generate a signed Bunny Stream HLS playlist URL for secure playback.
 * Token = SHA256(secret + bunnyVideoId + expires), base64url-encoded.
 * Use BUNNY_CDN_URL and BUNNY_TOKEN_KEY (or BUNNY_TOKEN_AUTH_KEY).
 *
 * @param {string} bunnyVideoId - Bunny Stream video guid
 * @param {number} [ttlSeconds=300] - Seconds until URL expires (default 5 minutes)
 * @returns {string} Signed URL: https://{BUNNY_CDN_URL}/{bunnyVideoId}/playlist.m3u8?token=...&expires=...
 */
function generateSignedStreamUrl(bunnyVideoId, ttlSeconds = 300) {
  if (!BUNNY_TOKEN_KEY || !bunnyVideoId) {
    const base = CDN_HOST ? `https://${CDN_HOST.replace(/^https?:\/\//, '')}` : '';
    return base ? `${base}/${bunnyVideoId}/playlist.m3u8` : '';
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const hashInput = BUNNY_TOKEN_KEY + bunnyVideoId + expiresAt;
  const token = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const base = CDN_HOST ? `https://${CDN_HOST.replace(/^https?:\/\//, '')}` : '';
  return `${base}/${bunnyVideoId}/playlist.m3u8?token=${token}&expires=${expiresAt}`;
}

module.exports = {
  generateSignedUrl,
  generateSignedUrlWithKey,
  generateSignedPlaybackUrl,
  generateSignedStreamUrl,
  signPath,
  signPathWithKey,
  signStorageCdnUrl,
};
