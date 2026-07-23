const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'live_session_added',
        'live_session_updated',
        'live_session_cancelled',
        'assignment_graded',
        'certificate_issued',
        'community_join_decided',
        'community_removed',
        'instructor_approval',
        'course_video_added',
        'system',
      ],
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: '', trim: true, maxlength: 500 },
    link: { type: String, default: null, trim: true, maxlength: 500 },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
