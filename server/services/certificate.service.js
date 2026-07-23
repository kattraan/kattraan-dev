const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const CourseProgress = require('../models/CourseProgress');
const LearnerCourses = require('../models/LearnerCourses');
const Course = require('../models/Course');
const User = require('../models/User');
const Section = require('../models/Section');

function buildCertificateId() {
  const hex = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
  return `KAT-${hex}`;
}

/**
 * Course.duration (minutes) if set; otherwise sum of video content durations (seconds → minutes).
 */
async function resolveCourseDurationMinutes(courseId, courseDurationField = null) {
  const stored = Number(courseDurationField);
  if (Number.isFinite(stored) && stored > 0) return Math.round(stored);

  const cid = String(courseId);
  if (!mongoose.Types.ObjectId.isValid(cid)) return null;

  const [agg] = await Section.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(cid), isDeleted: { $ne: true } } },
    { $lookup: { from: 'chapters', localField: '_id', foreignField: 'section', as: 'chaps' } },
    { $unwind: { path: '$chaps', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'contents',
        localField: 'chaps._id',
        foreignField: 'chapter',
        as: 'conts',
        pipeline: [{ $match: { type: 'video', isDeleted: { $ne: true } } }],
      },
    },
    { $unwind: { path: '$conts', preserveNullAndEmptyArrays: true } },
    { $group: { _id: null, totalSeconds: { $sum: { $ifNull: ['$conts.duration', 0] } } } },
  ]);

  const totalSeconds = Number(agg?.totalSeconds) || 0;
  if (totalSeconds <= 0) return null;
  return Math.max(1, Math.round(totalSeconds / 60));
}

function getClientBaseUrl() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  return raw.split(',')[0].trim().replace(/\/$/, '');
}

function buildVerifyUrl(certificateId) {
  return `${getClientBaseUrl()}/certificate/verify/${encodeURIComponent(certificateId)}`;
}

function formatCertificate(doc) {
  if (!doc) return null;
  const certificateId = doc.certificateId;
  return {
    certificateId,
    userId: doc.userId,
    courseId: doc.courseId,
    learnerName: doc.learnerName,
    courseTitle: doc.courseTitle,
    instructorName: doc.instructorName,
    issuedAt: doc.issuedAt,
    durationMinutes: doc.durationMinutes,
    verifyUrl: buildVerifyUrl(certificateId),
    revoked: !!doc.revoked,
  };
}

async function issueCertificate(userId, courseId) {
  const uid = String(userId);
  const cid = String(courseId);

  const existing = await Certificate.findOne({ userId: uid, courseId: cid }).lean();
  if (existing) return formatCertificate(existing);

  const progress = await CourseProgress.findOne({ userId: uid, courseId: cid }).lean();
  if (!progress?.completed) {
    const err = new Error('Course is not completed yet');
    err.statusCode = 400;
    throw err;
  }

  const enrollment = await LearnerCourses.findOne({
    userId: uid,
    'courses.courseId': cid,
  }).lean();
  const courseEntry = (enrollment?.courses || []).find((c) => String(c.courseId) === cid);
  if (!courseEntry) {
    const err = new Error('Not enrolled in this course');
    err.statusCode = 403;
    throw err;
  }

  const [user, course] = await Promise.all([
    User.findById(uid).select('userName').lean(),
    Course.findById(cid).select('title duration').lean(),
  ]);

  const durationMinutes = await resolveCourseDurationMinutes(cid, course?.duration);

  const certificateId = buildCertificateId();
  const doc = await Certificate.create({
    certificateId,
    userId: uid,
    courseId: cid,
    learnerName: user?.userName || 'Learner',
    courseTitle: course?.title || courseEntry.title || 'Course',
    instructorName: courseEntry.instructorName || 'Instructor',
    issuedAt: progress.completionDate || new Date(),
    durationMinutes,
  });

  const formatted = formatCertificate(doc);

  try {
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: uid,
      type: 'certificate_issued',
      title: 'Certificate earned',
      body: `You earned a certificate for ${formatted.courseTitle}.`,
      link: `/certificate/view/${encodeURIComponent(formatted.certificateId)}`,
      meta: {
        certificateId: formatted.certificateId,
        courseId: cid,
      },
    });
  } catch (e) {
    console.error('[issueCertificate] notification', e.message || e);
  }

  return formatted;
}

async function listUserCertificates(userId) {
  const uid = String(userId);

  const completedRows = await CourseProgress.find({ userId: uid, completed: true }).lean();
  await Promise.all(
    completedRows.map(async (row) => {
      const courseId = String(row.courseId);
      const exists = await Certificate.exists({ userId: uid, courseId });
      if (!exists) {
        try {
          await issueCertificate(uid, courseId);
        } catch {
          /* skip courses that fail validation */
        }
      }
    }),
  );

  const rows = await Certificate.find({ userId: uid, revoked: { $ne: true } })
    .sort({ issuedAt: -1 })
    .lean();

  return Promise.all(
    rows.map(async (row) => {
      if (!(Number(row.durationMinutes) > 0) && row.courseId) {
        const durationMinutes = await resolveCourseDurationMinutes(row.courseId);
        if (durationMinutes > 0) {
          row.durationMinutes = durationMinutes;
          Certificate.updateOne(
            { _id: row._id },
            { $set: { durationMinutes } },
          ).catch(() => {});
        }
      }
      return formatCertificate(row);
    }),
  );
}

async function getCertificateForUserCourse(userId, courseId) {
  const doc = await Certificate.findOne({
    userId: String(userId),
    courseId: String(courseId),
    revoked: { $ne: true },
  }).lean();
  if (!doc) return null;

  if (!(Number(doc.durationMinutes) > 0)) {
    const durationMinutes = await resolveCourseDurationMinutes(doc.courseId);
    if (durationMinutes > 0) {
      doc.durationMinutes = durationMinutes;
      Certificate.updateOne(
        { _id: doc._id },
        { $set: { durationMinutes } },
      ).catch(() => {});
    }
  }

  return formatCertificate(doc);
}

async function getCertificateRecordForDownload(userId, certificateId) {
  const doc = await Certificate.findOne({
    certificateId: String(certificateId).trim(),
    userId: String(userId),
    revoked: { $ne: true },
  }).lean();

  if (!doc) {
    const err = new Error('Certificate not found');
    err.statusCode = 404;
    throw err;
  }

  // Backfill duration for older certificates that stored null.
  if (!(Number(doc.durationMinutes) > 0) && doc.courseId) {
    const durationMinutes = await resolveCourseDurationMinutes(doc.courseId);
    if (durationMinutes > 0) {
      doc.durationMinutes = durationMinutes;
      Certificate.updateOne(
        { _id: doc._id },
        { $set: { durationMinutes } },
      ).catch(() => {});
    }
  }

  return doc;
}

async function verifyCertificate(certificateId) {
  const doc = await Certificate.findOne({
    certificateId: String(certificateId).trim(),
    revoked: { $ne: true },
  }).lean();

  if (!doc) {
    const err = new Error('Certificate not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    valid: true,
    certificateId: doc.certificateId,
    learnerName: doc.learnerName,
    courseTitle: doc.courseTitle,
    instructorName: doc.instructorName,
    issuedAt: doc.issuedAt,
    durationMinutes: doc.durationMinutes,
    verifyUrl: buildVerifyUrl(doc.certificateId),
    organization: 'Kattraan',
  };
}

module.exports = {
  issueCertificate,
  listUserCertificates,
  getCertificateForUserCourse,
  getCertificateRecordForDownload,
  verifyCertificate,
  resolveCourseDurationMinutes,
  buildVerifyUrl,
  getClientBaseUrl,
};
