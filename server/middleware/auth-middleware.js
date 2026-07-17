require("dotenv").config();
const jwt = require("jsonwebtoken");

const Blacklist = require("../models/Blacklist");
const User = require("../models/User");
const Role = require("../models/Role");

const authenticate = async (req, res, next) => {
  // Try to get token from Authorization header (Bearer) or accessToken cookie
  let token = null;
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  // Check if token is blacklisted
  const blacklisted = await Blacklist.findOne({ token });
  if (blacklisted) {
     return res.status(401).json({ success: false, message: "Token revoked" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const userId = payload._id || payload.user_id;

    // Normalize user fields for compatibility with both login and refresh flows
    req.user = {
      _id: userId,
      roles: Array.isArray(payload.roles || payload.role_id) ? (payload.roles || payload.role_id) : [payload.roles || payload.role_id],
      roleNames: payload.roleNames || [],
      iat: payload.iat,
      exp: payload.exp,
    };

    // Re-load the user from the DB so a deleted/banned account or a demoted
    // admin/instructor loses access immediately instead of after token TTL.
    const profile = await User.findById(userId)
      .select("userName userEmail email name phoneNumber roles")
      .lean();

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user.userName = profile.userName || profile.name || "";
    req.user.userEmail = profile.userEmail || profile.email || "";
    req.user.email = profile.email || profile.userEmail || "";
    req.user.name = profile.name || profile.userName || "";
    req.user.phoneNumber = profile.phoneNumber || "";
    req.user.phone = profile.phoneNumber || "";

    // Authoritative roles come from the DB, not the (cached) JWT claims.
    const roleIds = Array.isArray(profile.roles) ? profile.roles : [];
    req.user.roles = roleIds;
    try {
      const rolesData = await Role.find({ roleId: { $in: roleIds } }).select("roleName").lean();
      req.user.roleNames = rolesData.map((r) => r.roleName);
    } catch (roleErr) {
      console.warn("Failed to resolve roles from DB", roleErr.message);
      // Fall back to JWT roleNames rather than silently granting nothing.
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;
