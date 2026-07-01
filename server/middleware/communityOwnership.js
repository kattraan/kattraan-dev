const Community = require("../models/Community");
const CommunityMembership = require("../models/CommunityMembership");

/**
 * Community owner = community.createdBy (the instructor who created it), or any admin.
 * Mirrors the course ownership pattern in courseOwnership.js.
 */
function isAdmin(req) {
  return (
    !!req.user &&
    Array.isArray(req.user.roleNames) &&
    req.user.roleNames.map((r) => String(r).toLowerCase()).includes("admin")
  );
}

/**
 * @param {object} req
 * @param {string} communityId
 * @returns {Promise<{ ok?: true, notFound?: true, forbidden?: true, community?: object }>}
 */
async function ensureUserCanManageCommunity(req, communityId) {
  if (!communityId) return { forbidden: true };
  const community = await Community.findOne({ _id: communityId, isDeleted: { $ne: true } }).lean();
  if (!community) return { notFound: true };
  if (isAdmin(req)) return { ok: true, community };
  if (String(community.createdBy) !== String(req.user._id)) return { forbidden: true };
  return { ok: true, community };
}

/** Middleware: require community owner (creator) or admin. Attaches req.community. */
function requireCommunityOwner(paramName = "id") {
  return async (req, res, next) => {
    const result = await ensureUserCanManageCommunity(req, req.params[paramName]);
    if (result.notFound) return res.status(404).json({ success: false, message: "Community not found" });
    if (result.forbidden)
      return res.status(403).json({ success: false, message: "You can only manage your own community" });
    req.community = result.community;
    next();
  };
}

/**
 * Middleware: require an approved member of the community, or its owner/admin.
 * Attaches req.community and req.communityMembership (null for owner/admin who never joined).
 */
function requireCommunityMember(paramName = "id") {
  return async (req, res, next) => {
    const communityId = req.params[paramName];
    const community = await Community.findOne({ _id: communityId, isDeleted: { $ne: true } }).lean();
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });

    if (isAdmin(req) || String(community.createdBy) === String(req.user._id)) {
      req.community = community;
      req.communityMembership = null;
      return next();
    }

    const membership = await CommunityMembership.findOne({
      community: communityId,
      user: req.user._id,
      status: "approved",
    }).lean();

    if (!membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this community" });
    }

    req.community = community;
    req.communityMembership = membership;
    next();
  };
}

module.exports = {
  ensureUserCanManageCommunity,
  requireCommunityOwner,
  requireCommunityMember,
  isAdmin,
};
