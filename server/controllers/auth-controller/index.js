const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/User");
const Role = require("../../models/Role");
require("dotenv").config();
const crypto = require("crypto");
const { sendEmail } = require("../../services/gmailService");
const { createEmailTemplate } = require("../../services/emailTemplates");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { validatePasswordStrength } = require("../../helpers/passwordValidator");
const Blacklist = require("../../models/Blacklist");
const AuditLog = require("../../models/AuditLog");
const {
  getAuthCookieSameSite,
  getAuthCookieSecure,
} = require("../../config/authCookies");
const { effectiveRoleNames, primaryRoleName } = require("../../helpers/instructorAccess");

// Helper to log user activity
const logAudit = async (userId, action, req, details = {}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      details
    });
  } catch (err) {
    console.error("Audit Log Failure:", err);
  }
};

const getSafeProfile = async (user) => {
  const Role = require("../../models/Role");
  const rolesData = await Role.find({ roleId: { $in: user.roles } });
  const roleNames = effectiveRoleNames(rolesData.map((r) => r.roleName), user.status);

  return {
    _id: user._id,
    userName: user.userName,
    userEmail: user.userEmail,
    status: user.status,
    instructorApprovedAt: user.instructorApprovedAt || null,
    enrollmentData: user.enrollmentData || null,
    roles: roleNames,
    role: primaryRoleName(roleNames),
  };
};

const findRoleByName = async (roleName) => Role.findOne({ roleName });

const grantInstructorRole = async (user) => {
  const instructor = await findRoleByName("instructor");
  const learner = await findRoleByName("learner");
  if (!instructor || !learner) {
    throw new Error("System configuration error");
  }
  if (!user.roles.includes(learner.roleId)) {
    user.roles.push(learner.roleId);
  }
  if (!user.roles.includes(instructor.roleId)) {
    user.roles.push(instructor.roleId);
  }
  return instructor;
};

const revokeInstructorRole = async (user) => {
  const instructor = await findRoleByName("instructor");
  const learner = await findRoleByName("learner");
  if (!instructor || !learner) {
    throw new Error("System configuration error");
  }
  user.roles = (user.roles || []).filter((id) => id !== instructor.roleId);
  if (!user.roles.includes(learner.roleId)) {
    user.roles.push(learner.roleId);
  }
  return instructor;
};

/** Strip instructor from accounts that were never admin-approved (legacy bypass). */
const sanitizeUnapprovedInstructor = async (user) => {
  if (!user || user.status === "approved") return;
  const rolesData = await Role.find({ roleId: { $in: user.roles || [] } });
  const names = rolesData.map((r) => r.roleName);
  if (names.includes("admin") || !names.includes("instructor")) return;
  await revokeInstructorRole(user);
};

/**
 * Instructors may log in while enrollment/approval is in progress so they can
 * finish the form and see the waiting page. Instructor-only APIs stay gated
 * in role middleware until status === 'approved'.
 * Rejected instructors can still sign in to view the rejection screen.
 */

const MAX_SESSIONS = 3;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const sendVerificationOtpEmail = async (user, otp) => {
  const path = require("path");

  const content = `
    <h2>Verify Your Email</h2>
    <p>Hi <strong>${user.userName}</strong>, welcome to Kattraan!</p>
    <p>Use the code below to complete your registration:</p>
    <div class="otp-card">
      <div class="otp-digits">${otp}</div>
      <div class="otp-label">Verification Code</div>
    </div>
    <div class="expiry-pill">&#x23F1; Expires in 10 minutes</div>
    <hr class="rule" />
    <p class="note">Didn't create an account? You can safely ignore this email.</p>
  `;

  await sendEmail({
    to: user.userEmail,
    subject: "Verify your Kattraan account",
    message: createEmailTemplate("Email Verification", content),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../../../client/src/assets/logo.png"),
        cid: "kattranLogo",
      },
    ],
  });
};

const setEmailVerificationOtp = async (user) => {
  const otp = generateOtp();
  user.emailVerificationOtp = await bcrypt.hash(otp, 10);
  user.emailVerificationOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();
  await sendVerificationOtpEmail(user, otp);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[auth] verification OTP sent to ${user.userEmail}`);
  }
  return otp;
};

// =======================
// ✅ Register User
// =======================
// in controllers/auth-controller/index.js
const registerUser = async (req, res) => {
  const { userName, userEmail, password, roles: requestedRoles } = req.body;

  // Fetch roles from database
  const learnerRole = await Role.findOne({ roleName: 'learner' });
  const instructorRole = await Role.findOne({ roleName: 'instructor' });

  if (!learnerRole || !instructorRole) {
    return res.status(500).json({ success: false, message: "System configuration error" });
  }

  // Validate password strength
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters."
    });
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Determine roles and status
  let finalRoles = [];
  let status = 'active';

  // Instructor signup stays a learner until admin approval. Never grant the
  // instructor role at registration — that happens only in adminApproveInstructor.
  if (requestedRoles && (requestedRoles.includes(2) || requestedRoles.includes('2'))) {
    finalRoles = [learnerRole.roleId];
    status = 'pending_enrollment';
  } else {
    finalRoles = [learnerRole.roleId];
  }

  // Create user (catch duplicate email → 400)
  let user;
  try {
    user = await User.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      password: hash,
      roles: finalRoles,
      status: status,
      isVerified: false,
    });
    await logAudit(user._id, 'SIGNUP', req, { email: userEmail, roles: finalRoles });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.userEmail) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }
    throw err;
  }

  try {
    await setEmailVerificationOtp(user);
  } catch (emailErr) {
    console.error("Verification email failed:", emailErr);
    await User.findByIdAndDelete(user._id);
    return res.status(500).json({
      success: false,
      message: "Could not send verification email. Please try again later.",
    });
  }

  res.status(201).json({
    success: true,
    message: "Account created. Please check your email for the verification code.",
    requiresVerification: true,
  });
};

// =======================
// ✅ Submit Enrollment
// =======================
const submitEnrollment = async (req, res) => {
  try {
    const {
      bio,
      experience,
      expertise,
      linkedin,
      website,
      github,
      languages,
      resumeName,
      idProofName,
    } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Learners can submit the enrollment form directly; start the application if needed.
    if (user.status === "active") {
      await revokeInstructorRole(user);
      user.status = "pending_enrollment";
    }

    const canSubmit = ['pending_enrollment', 'pending_approval', 'rejected'].includes(user.status);
    if (!canSubmit) {
      return res.status(403).json({
        success: false,
        message: "Start an instructor application before submitting enrollment.",
      });
    }

    // Update enrollment data and status — still a learner until admin approves
    const existingEnrollment =
      user.enrollmentData && typeof user.enrollmentData.toObject === "function"
        ? user.enrollmentData.toObject()
        : (user.enrollmentData || {});
    user.enrollmentData = {
      ...existingEnrollment,
      bio: bio ?? existingEnrollment.bio,
      experience: experience ?? existingEnrollment.experience,
      expertise: expertise ?? existingEnrollment.expertise,
      linkedin: linkedin || existingEnrollment.linkedin,
      website: website || existingEnrollment.website,
      github: github || existingEnrollment.github,
      languages: Array.isArray(languages) ? languages : existingEnrollment.languages,
      resume: resumeName || existingEnrollment.resume,
      idProof: idProofName || existingEnrollment.idProof,
      submittedAt: new Date()
    };
    user.status = 'pending_approval';
    await revokeInstructorRole(user);
    await user.save();

    const safeProfile = await getSafeProfile(user);
    res.json({
      success: true,
      message: "Enrollment submitted. Awaiting admin approval.",
      user: safeProfile,
    });
  } catch (error) {
    console.error("Enrollment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ Admin Approve Instructor
// =======================
const adminApproveInstructor = async (req, res) => {
  try {
    const { userId, action } = req.body; // approve | reject | disapprove

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (action === 'approve') {
      await grantInstructorRole(user);
      user.status = 'approved';
      user.instructorApprovedAt = new Date();
    } else if (action === 'reject' || action === 'disapprove') {
      await revokeInstructorRole(user);
      user.instructorApprovedAt = null;
      user.status = action === 'disapprove' ? 'active' : 'rejected';
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    await user.save();
    const safeProfile = await getSafeProfile(user);

    try {
      const notificationService = require("../../services/notification.service");
      const approved = action === "approve";
      const revoked = action === "disapprove";
      await notificationService.createNotification({
        userId: user._id,
        type: "instructor_approval",
        title: approved
          ? "Instructor account approved"
          : revoked
            ? "Instructor access revoked"
            : "Instructor application update",
        body: approved
          ? "Your instructor account was approved. You can start creating courses."
          : revoked
            ? "Your instructor access was revoked by an admin. You can continue as a learner."
            : "Your instructor application was not approved. Check your enrollment status for details.",
        link: approved ? "/instructor-dashboard" : "/dashboard",
        meta: { action },
      });
    } catch (e) {
      console.error("[adminApproveInstructor] notification", e.message || e);
    }

    const verb = action === 'disapprove' ? 'revoked' : `${action}d`;
    res.json({ success: true, message: `Instructor ${verb} successfully`, user: safeProfile });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ Login User
// =======================

const loginUser = async (req, res) => {
  try {
    const { userEmail, password: userPassword } = req.body;
    if (!userEmail || !userPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    // Find the user
    let user = await User.findOne({ userEmail: userEmail.toLowerCase() });

    const isDev = process.env.NODE_ENV !== 'production';

    // No account found with this email
    if (!user) {
      console.warn(`[Login] No account found for email: ${userEmail}`);
      return res.status(401).json({
        success: false,
        message: isDev
          ? `No account found with email "${userEmail}". Please sign up first.`
          : "Invalid credentials",
      });
    }

    // Google One Tap used to store a plaintext placeholder — those accounts must use Google or reset password
    const storedPassword = user.password;
    const isBcryptHash = typeof storedPassword === "string" && /^\$2[aby]?\$/.test(storedPassword);
    if (!isBcryptHash) {
      console.warn(`[Login] Non-bcrypt password hash for email: ${userEmail} (likely Google-only account)`);
      return res.status(401).json({
        success: false,
        message: user.googleId
          ? "This account uses Google sign-in. Continue with Google, or use Forgot password to set a password."
          : "This account cannot use password login. Please use Forgot password to set a new password.",
      });
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(userPassword, storedPassword);
    } catch (compareErr) {
      console.error(`[Login] bcrypt.compare failed for ${userEmail}:`, compareErr.message);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please try again or reset your password.",
      });
    }
    if (!isPasswordValid) {
      console.warn(`[Login] Wrong password for email: ${userEmail}`);
      await logAudit(user._id, 'LOGIN_FAILED', req);
      return res.status(401).json({
        success: false,
        message: isDev
          ? "Incorrect password. Please try again or reset your password."
          : "Invalid credentials",
      });
    }

    if (user.isVerified === false) {
      await logAudit(user._id, 'LOGIN_FAILED', req, { reason: 'email_not_verified' });
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresVerification: true,
      });
    }

    // --- Session Management ---
    // Remove expired sessions first
    user.sessions = (user.sessions || []).filter(s => s.expiresAt > Date.now());

    // Enforce max sessions (remove oldest if limit reached)
    if (user.sessions.length >= MAX_SESSIONS) {
      user.sessions.sort((a, b) => a.lastActive - b.lastActive); // sort by oldest activity
      user.sessions.shift(); // remove the oldest
    }

    // Generate tokens
    await sanitizeUnapprovedInstructor(user);
    const roleIds = user.roles;
    const rolesData = await Role.find({ roleId: { $in: roleIds } });
    const roleNames = effectiveRoleNames(rolesData.map(r => r.roleName), user.status);

    const accessToken = jwt.sign(
      { _id: user._id, roles: roleIds, roleNames: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // Matches cookie maxAge
    );

    // Hash refresh token for storage
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Add new session
    user.sessions.push({
      refreshToken: hashedRefreshToken,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastActive: new Date()
    });

    try {
      await user.save();
    } catch (saveErr) {
      // Concurrent logins (two tabs / Google + form) can race on sessions — retry once
      if (saveErr?.name === "VersionError" || saveErr?.code === 11000) {
        const fresh = await User.findById(user._id);
        if (!fresh) throw saveErr;
        fresh.sessions = (fresh.sessions || []).filter((s) => s.expiresAt > Date.now());
        if (fresh.sessions.length >= MAX_SESSIONS) {
          fresh.sessions.sort((a, b) => a.lastActive - b.lastActive);
          fresh.sessions.shift();
        }
        fresh.sessions.push({
          refreshToken: hashedRefreshToken,
          ip: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastActive: new Date(),
        });
        await fresh.save();
        user = fresh;
      } else {
        throw saveErr;
      }
    }

    await logAudit(user._id, 'LOGIN', req);

    const safeProfile = await getSafeProfile(user);

    // Set Cookies (SameSite=None when SPA and API are on different hosts — e.g. Vercel + Render)
    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    // Include profile so the client does not need a fragile follow-up /check-auth
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: safeProfile },
      user: safeProfile,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : (err.message || "Login failed due to a server error."),
    });
  }
};

// ===========================
// ✅ Refresh Access Token
// ===========================
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(decoded._id || decoded.user_id);

    if (!user) return res.status(403).json({ success: false, message: "User not found" });

    // Find the session matching this refresh token (current or brief previous grace)
    // so two browser tabs refreshing at once don't invalidate each other.
    let sessionIndex = -1;
    let matchedPrevious = false;
    for (let i = 0; i < user.sessions.length; i++) {
      const session = user.sessions[i];
      const isCurrent = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isCurrent) {
        sessionIndex = i;
        break;
      }
      if (
        session.previousRefreshToken &&
        session.previousRefreshExpires &&
        session.previousRefreshExpires > new Date()
      ) {
        const isPrevious = await bcrypt.compare(refreshToken, session.previousRefreshToken);
        if (isPrevious) {
          sessionIndex = i;
          matchedPrevious = true;
          break;
        }
      }
    }

    if (sessionIndex === -1) {
      return res.status(403).json({ success: false, message: "Invalid refresh token (session not found)" });
    }

    // Check expiration
    if (user.sessions[sessionIndex].expiresAt < Date.now()) {
      user.sessions.splice(sessionIndex, 1);
      await user.save();
      return res.status(403).json({ success: false, message: "Session expired" });
    }

    // If this request still holds the just-rotated previous token, only mint a new
    // access token and re-send the already-current refresh cookie (no second rotation).
    await sanitizeUnapprovedInstructor(user);
    const roleIds = user.roles;
    const rolesData = await Role.find({ roleId: { $in: roleIds } });
    const roleNames = effectiveRoleNames(rolesData.map(r => r.roleName), user.status);

    const newAccessToken = jwt.sign(
      { _id: user._id, roles: roleIds, roleNames: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();

    if (matchedPrevious) {
      user.sessions[sessionIndex].lastActive = new Date();
      await user.save();

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: 15 * 60 * 1000,
      });
      // Keep the current refresh cookie as-is (already set by the winning tab).
      return res.status(200).json({ success: true, message: "Token refreshed" });
    }

    // **Token Rotation** (keep old hash for ~60s for concurrent tabs)
    const newRefreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const previousHash = user.sessions[sessionIndex].refreshToken;
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    user.sessions[sessionIndex].previousRefreshToken = previousHash;
    // Long enough for discarded/background tabs to wake up and refresh
    // without losing the race to another tab's rotation.
    user.sessions[sessionIndex].previousRefreshExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.sessions[sessionIndex].refreshToken = newRefreshTokenHash;
    user.sessions[sessionIndex].lastActive = new Date();
    user.sessions[sessionIndex].expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (error) {
    console.error("Token Refresh Error:", error);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

// ===========================
//  Become Instructor
// ===========================
const becomeInstructor = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.status === "approved") {
      await grantInstructorRole(user);
      await user.save();
      const safeProfile = await getSafeProfile(user);
      return res.json({
        success: true,
        message: "You are already an approved instructor.",
        user: safeProfile,
      });
    }

    if (user.status === "pending_approval") {
      const safeProfile = await getSafeProfile(user);
      return res.json({
        success: true,
        message: "Your instructor application is awaiting admin approval.",
        user: safeProfile,
      });
    }

    // Stay a learner. Admin approval is the only path that grants instructor.
    await revokeInstructorRole(user);
    user.status = "pending_enrollment";
    await user.save();

    const safeProfile = await getSafeProfile(user);
    res.json({
      success: true,
      message: "Application started. Complete enrollment for admin review.",
      user: safeProfile,
    });
  } catch (error) {
    console.error("Become Instructor Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// ✅ Logout User
// ===========================
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      // Decode to get expiration for blacklist
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        await Blacklist.create({ token: accessToken, expiresAt });
      }
    }

    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
    });

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
        const user = await User.findById(decoded._id || decoded.user_id);

        if (user) {
          // Remove the specific session matching this refresh token
          // Since we only have the plain token and stored hashed, we loop
          user.sessions = user.sessions || []; // ensure array
          let matchIndex = -1;
          for (let i = 0; i < user.sessions.length; i++) {
            if (await bcrypt.compare(refreshToken, user.sessions[i].refreshToken)) {
              matchIndex = i;
              break;
            }
          }

          if (matchIndex !== -1) {
            user.sessions.splice(matchIndex, 1);
            await user.save();
          }
          await logAudit(user._id, 'LOGOUT', req);
        }
      } catch (e) {
        // Token verification failed, user might be already logged out or token manipulated
        console.warn("Logout token verification failed", e.message);
      }
    }

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================
// ✅ Logout ALL Sessions
// ===========================
const logoutAll = async (req, res) => {
  try {
    const userId = req.user._id; // Assumes auth middleware has run
    const user = await User.findById(userId);

    if (user) {
      user.sessions = []; // Clear all sessions
      await user.save();
      await logAudit(userId, 'LOGOUT_ALL', req);
    }

    // Blacklist current access token
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      const expiresAt = new Date(decoded.exp * 1000);
      try {
        await Blacklist.create({ token: accessToken, expiresAt });
      } catch (e) { /* ignore duplicate key error if any */ }
    }

    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite,
      secure,
      path: "/",
    });

    res.json({ success: true, message: "Logged out from all devices" });
  } catch (err) {
    console.error("Logout All Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Verify Email OTP ────────────────────────────────────────────────────────
const verifyEmailOtp = async (req, res) => {
  try {
    const { userEmail, otp } = req.body;
    if (!userEmail || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const user = await User.findOne({ userEmail: userEmail.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "Email already verified." });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Verification code expired. Please request a new one." });
    }

    const isOtpValid = await bcrypt.compare(String(otp).trim(), user.emailVerificationOtp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    user.isVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpires = null;
    await user.save();

    await logAudit(user._id, 'EMAIL_VERIFIED', req);

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Resend Verification OTP ─────────────────────────────────────────────────
const resendVerificationOtp = async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ userEmail: userEmail.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered and unverified, you will receive a new code.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified." });
    }

    await setEmailVerificationOtp(user);

    return res.status(200).json({ success: true, message: "Verification code sent." });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ success: false, message: "Could not send verification email. Please try again later." });
  }
};

// ─── Request Password Reset ──────────────────────────────────────────────────
const requestPasswordReset = async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const user = await User.findOne({ userEmail: userEmail.toLowerCase() });
  if (!user) {
    // don't reveal if user exists
    return res.status(200).json({
      success: true,
      message: "If that email is registered, you’ll receive a reset link.",
    });
  }

  // Generate a token and expiry (e.g. 1 hour)
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600_000; // 1h
  await user.save();

  // Send email
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  // Using a cleaner message format
  const message = `
      <h2 style="color: #ffffff; margin-top: 0;">Reset Your Password</h2>
      <p>Hi ${user.userName},</p>
      <p>You recently requested to reset your password for your Kattraan account. Click the button below to proceed:</p>
      <div class="button-container">
        <a href="${resetUrl}" class="cta-button">Reset Password</a>
      </div>
      <p>This password reset link will expire in 1 hour.</p>
      <p style="font-size: 14px; opacity: 0.7;">If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
    `;

  const path = require("path");

  await sendEmail({
    to: user.userEmail,
    subject: "Reset your Kattraan password",
    message: createEmailTemplate("Reset Password", message),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../../../client/src/assets/logo.png'),
        cid: 'kattranLogo' // same cid value as in the html img src
      }
    ]
  });

  return res
    .status(200)
    .json({ success: true, message: "Password reset email sent" });
};

// ─── Perform Password Reset ──────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Token and new password required" });
  }

  // Find user by token and ensure token not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }

  // Validate password strength
  if (!validatePasswordStrength(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters."
    });
  }

  // Hash new password and clear token fields
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // (Optionally) log the user in by issuing tokens
  return res
    .status(200)
    .json({ success: true, message: "Password has been reset" });
};

// ===========================
// ✅ Google Auth Callback
// ===========================
// ===========================
// ✅ Google Auth Callback
// ===========================
const googleCallback = async (req, res) => {
  try {
    const user = req.user; // Passport attaches the user to req.user

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Extract roles
    await sanitizeUnapprovedInstructor(user);
    const roleIds = user.roles;
    const rolesData = await Role.find({ roleId: { $in: roleIds } });
    const roleNames = effectiveRoleNames(rolesData.map(r => r.roleName), user.status);

    // 1) Create Access Token
    const accessToken = jwt.sign(
      { _id: user._id, roles: roleIds, roleNames: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    // 2) Create Refresh Token
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "100d" }
    );

    // 3) Hash & store Refresh Token in Session
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Manage Sessions
    user.sessions = user.sessions || [];
    user.sessions = user.sessions.filter(s => s.expiresAt > Date.now());
    if (user.sessions.length >= MAX_SESSIONS) {
      user.sessions.sort((a, b) => a.lastActive - b.lastActive);
      user.sessions.shift();
    }

    user.sessions.push({
      refreshToken: hashedRefreshToken,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastActive: new Date()
    });

    await user.save();

    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    // 6) Redirect to Frontend
    // We NO LONGER put the token in the URL.
    // The cookie is set. The frontend just needs to check verify endpoint or check validity.
    // BUT since we are redirecting, we might want to signal success.
    // For now, redirect to dashboard or login success page.
    res.redirect(`${process.env.CLIENT_URL}/auth-success`); // Frontend needs to handle this route to confirm and maybe fetch user details

  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// ===========================
// ✅ Google One Tap Login
// ===========================
const googleOneTapLogin = async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ success: false, message: "ID Token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // 1. Check if user exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Check by email to link accounts
      user = await User.findOne({ userEmail: email.toLowerCase() });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        // 3. Create new user (fetch learner role UUID)
        const learnerRole = await Role.findOne({ roleName: 'learner' });
        if (!learnerRole) {
          return res.status(500).json({ success: false, message: "System configuration error" });
        }

        // Store a random bcrypt hash — Google accounts should sign in with Google (or reset password)
        const randomSecret = crypto.randomBytes(32).toString("hex");
        const googlePasswordHash = await bcrypt.hash(randomSecret, 10);
        user = await User.create({
          userName: name,
          userEmail: email.toLowerCase(),
          googleId: googleId,
          password: googlePasswordHash,
          roles: [learnerRole.roleId], // Store UUID
          status: 'active',
          isVerified: true
        });
      }
    }

    // 4. Generate Tokens
    await sanitizeUnapprovedInstructor(user);
    const roleIds = user.roles;
    const rolesData = await Role.find({ roleId: { $in: roleIds } });
    const roleNames = effectiveRoleNames(rolesData.map(r => r.roleName), user.status);

    const accessToken = jwt.sign(
      { _id: user._id, roles: roleIds, roleNames: roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "100d" }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "100d" }
    );

    // Hash & store Refresh Token in Session
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Manage Sessions
    user.sessions = user.sessions || [];
    user.sessions = user.sessions.filter(s => s.expiresAt > Date.now());
    if (user.sessions.length >= MAX_SESSIONS) {
      user.sessions.sort((a, b) => a.lastActive - b.lastActive);
      user.sessions.shift();
    }

    user.sessions.push({
      refreshToken: hashedRefreshToken,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastActive: new Date()
    });

    await user.save();

    const sameSite = getAuthCookieSameSite();
    const secure = getAuthCookieSecure();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    await logAudit(user._id, 'LOGIN', req, { method: 'google_onetap' });

    const safeProfile = await getSafeProfile(user);

    res.status(200).json({
      success: true,
      message: "Google One Tap login successful",
      data: { user: safeProfile },
      user: safeProfile,
    });

  } catch (error) {
    console.error("Google One Tap Error:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

// ===========================
//  Become Learner (Join as Learner)
// ===========================
const becomeLearner = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const learnerRole = await Role.findOne({ roleName: "learner" });
    if (!learnerRole) {
      return res.status(500).json({ success: false, message: "Learner role not found" });
    }

    // Add role UUID if not present
    if (!user.roles.includes(learnerRole.roleId)) {
      user.roles.push(learnerRole.roleId);
      await user.save();
    }

    const safeProfile = await getSafeProfile(user);
    res.json({ success: true, message: "Success! You are now joined as a learner.", user: safeProfile });
  } catch (error) {
    console.error("Become Learner Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  becomeInstructor,
  becomeLearner,
  logoutUser,
  verifyEmailOtp,
  resendVerificationOtp,
  requestPasswordReset,
  resetPassword,
  submitEnrollment,
  adminApproveInstructor,
  googleCallback,
  googleOneTapLogin,
  logoutAll
};
