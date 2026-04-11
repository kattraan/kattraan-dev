const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be null for failed login attempts where user isn't found/known yet
  },
  action: {
    type: String,
    required: true,
    enum: ['SIGNUP', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL', 'REFRESH_TOKEN', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS'],
  },
  ip: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // flexible for storing extra info like error messages or specific metadata
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
