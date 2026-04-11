const mongoose = require('mongoose');
const crypto = require("crypto");
// Define User Schema
const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [{
    type: String,  // Now storing UUID strings
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'pending_enrollment', 'pending_approval', 'approved', 'rejected'],
    default: 'active'
  },
  enrollmentData: {
    bio: String,
    experience: String,
    expertise: String,
    linkedin: String,
    website: String,
    resume: String, // Path to uploaded file
    submittedAt: Date,
    // Profile / account settings
    gender: String,
    dateOfBirth: Date,
    category: String,
    showSubscriberCount: { type: Boolean, default: true },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
      linkedin: String,
    },
    socialDisplayOnProfile: { type: mongoose.Schema.Types.Mixed, default: {} }, // { facebook: true, ... }
    invoiceAddress: { type: mongoose.Schema.Types.Mixed, default: null }, // { displayName, address, pincode, gstRegName, ... }
  },
  phoneNumber: { type: String, default: null },
  sessions: [{
    refreshToken: { type: String, required: true },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
  }],
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});


module.exports = mongoose.model('User', UserSchema);
