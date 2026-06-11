const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  becomeInstructor,
  logoutUser,
  requestPasswordReset, resetPassword,
  submitEnrollment,
  adminApproveInstructor,
  becomeLearner,
  googleCallback,
  googleOneTapLogin,
  logoutAll
} = require("../../controllers/auth-controller/index");

const passport = require("passport");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const validateRequest = require("../../middleware/validateRequest");
const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateSubmitEnrollment,
  validateAdminApprove,
  validateGoogleOneTap,
} = require("../../validations/auth");

const router = express.Router();

const validateRegister = [
  body("userName").notEmpty().withMessage("Username is required").trim().isLength({ max: 100 }).withMessage("Username too long"),
  body("userEmail").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character"),
  validateRequest,
];

const isDev = process.env.NODE_ENV !== 'production';

// Login rate limiter — stricter in production, relaxed in dev
const loginLimiter = isDev
  ? (_req, _res, next) => next() // no limit in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      // Return JSON so the client can read error.response.data.message
      handler: (req, res) => {
        const resetAt = new Date(req.rateLimit.resetTime);
        const minutesLeft = Math.ceil((resetAt - Date.now()) / 60000);
        res.status(429).json({
          success: false,
          message: `Too many login attempts. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
        });
      },
    });

// General limiter for other auth routes — off in dev, generous in production
const authLimiter = isDev
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300, // 300 requests per 15 mins (check-auth is called on every page load)
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests. Please slow down and try again shortly.',
        });
      },
    });

router.use(authLimiter);

// Routes
router.post("/register", ...validateRegister, registerUser);
router.post("/login", loginLimiter, ...validateLogin, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/become-instructor", authenticateMiddleware, becomeInstructor);
router.post("/become-learner", authenticateMiddleware, becomeLearner);
router.post("/logout", logoutUser);
router.post("/logout-all", authenticateMiddleware, logoutAll);
router.post("/forgot-password", ...validateForgotPassword, requestPasswordReset);
router.post("/reset-password", ...validateResetPassword, resetPassword);
router.post("/submit-enrollment", authenticateMiddleware, ...validateSubmitEnrollment, submitEnrollment);
router.post("/admin-approve", authenticateMiddleware, authorizeRoles("admin"), ...validateAdminApprove, adminApproveInstructor);

// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // We use JWT, not session cookies
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false,
  }),
  googleCallback
);

router.post("/google/one-tap", ...validateGoogleOneTap, googleOneTapLogin);


// Check authentication — always returns 200 to avoid browser console 401 noise.
// Unauthenticated users get { isAuthenticated: false }; authenticated users get their profile.
router.get("/check-auth", async (req, res) => {
  try {
    const jwt = require("jsonwebtoken");
    const Blacklist = require("../../models/Blacklist");
    const User = require("../../models/User");
    const Role = require("../../models/Role");

    // Extract token from Authorization header or HttpOnly cookie
    let token = null;
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(200).json({ success: true, isAuthenticated: false });
    }

    // Check blacklist
    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      return res.status(200).json({ success: true, isAuthenticated: false });
    }

    // Verify JWT — expired / invalid → treat as unauthenticated
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return res.status(200).json({ success: true, isAuthenticated: false });
    }

    const user = await User.findById(payload._id || payload.user_id);
    if (!user) {
      return res.status(200).json({ success: true, isAuthenticated: false });
    }

    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const roleNames = rolesData.map(r => r.roleName);

    const safeProfile = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      status: user.status,
      roles: roleNames,
      role: roleNames.includes('admin') ? 'admin' : (roleNames.includes('instructor') ? 'instructor' : 'learner'),
    };

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      message: "Authenticated user!",
      data: { user: safeProfile },
    });
  } catch (error) {
    console.error("Check Auth Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
