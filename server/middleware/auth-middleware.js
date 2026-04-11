require("dotenv").config();
const jwt = require("jsonwebtoken");


const Blacklist = require("../models/Blacklist");

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
    // Normalize user fields for compatibility with both login and refresh flows
    req.user = {
      _id: payload._id || payload.user_id,
      roles: Array.isArray(payload.roles || payload.role_id) ? (payload.roles || payload.role_id) : [payload.roles || payload.role_id],
      roleNames: payload.roleNames || [],
      iat: payload.iat,
      exp: payload.exp,
    };
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;
