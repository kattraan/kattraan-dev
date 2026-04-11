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


// Protected route to check authentication
router.get("/check-auth", authenticateMiddleware, async (req, res) => {
  try {
    const User = require("../../models/User");
    const Role = require("../../models/Role");
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch all roles for multi-role awareness
    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const roleNames = rolesData.map(r => r.roleName);

    // Minimal profile for UI (NO UUIDs, NO sessions, NO internal structures)
    const safeProfile = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      status: user.status,
      roles: roleNames,
      role: roleNames.includes('admin') ? 'admin' : (roleNames.includes('instructor') ? 'instructor' : 'learner')
    };

    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      data: { user: safeProfile },
    });
  } catch (error) {
    console.error("Check Auth Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
