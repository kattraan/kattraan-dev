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
 * GET /api/videos/:chapterId/play
 *
 * Returns a short-lived signed Bunny CDN URL for the video content inside
 * the requested chapter.  The caller must be:
 *   - Authenticated (handled by authenticate middleware)
 *   - Enrolled in the course that contains the chapter, OR an instructor / admin
 *
 * The signed URL expires after BUNNY_TOKEN_AUTH_KEY TTL (default 4 h).
 * Clients should refetch this endpoint when the URL has expired and retry.
 */
async function getVideoPlayUrl(req, res) {
  try {
    const chapterId = req.params.chapterId;
    const userId = req.user._id.toString();
    const userRole = resolveUserRole(req.user);

    const result = await videoService.getChapterPlayUrl(chapterId, userId, userRole);

    if (!result) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or video content not found',
      });
    }

    return res.json({
      success: true,
      data: {
        signedUrl: result.signedUrl,
        contentId: result.contentId,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getVideoPlayUrl };
