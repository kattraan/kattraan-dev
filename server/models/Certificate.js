const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    learnerName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    instructorName: { type: String, default: 'Instructor' },
    issuedAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: null },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
