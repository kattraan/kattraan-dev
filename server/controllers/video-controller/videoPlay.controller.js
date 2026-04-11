const videoService = require('../../services/video.service');

function resolveUserRole(user) {
  const roles = Array.isArray(user?.roleNames)
    ? user.roleNames.map((r) => String(r).toLowerCase())
    : [];
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('instructor')) return 'instructor';
  return String(user?.role?.name || user?.roleName || 'learner').toLowerCase();
}

/**
 * GET /api/videos/:videoId/play
 *
 * Secure video access API. Verifies authentication and enrollment, then returns
 * a temporary signed Bunny CDN playback URL. Video URLs are never returned from
 * the database directly.
 */
async function getPlayUrl(req, res) {
  try {
    const videoId = req.params.videoId;
    const userId = req.user._id.toString();
    const userRole = resolveUserRole(req.user);

    const result = await videoService.getVideoPlayUrlByVideoId(videoId, userId, userRole);

    if (!result) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or video not found',
      });
    }

    return res.json({
      success: true,
      playbackUrl: result.playbackUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getPlayUrl };
