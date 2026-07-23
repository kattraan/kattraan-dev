const Notification = require('../models/Notification');

function formatNotification(doc) {
  if (!doc) return null;
  const n = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    body: n.body || '',
    link: n.link || null,
    meta: n.meta || null,
    readAt: n.readAt || null,
    createdAt: n.createdAt,
    isRead: !!n.readAt,
  };
}

function emitToUser(userId, payload) {
  try {
    const { getIO } = require('../socket');
    const io = getIO();
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit('notification', payload);
  } catch {
    /* socket optional */
  }
}

/**
 * Persist one notification and push to the user's socket room when available.
 */
async function createNotification({ userId, type, title, body = '', link = null, meta = null }) {
  if (!userId || !type || !title) return null;
  const doc = await Notification.create({
    userId,
    type,
    title: String(title).slice(0, 200),
    body: String(body || '').slice(0, 500),
    link: link ? String(link).slice(0, 500) : null,
    meta: meta || null,
  });
  const formatted = formatNotification(doc);
  emitToUser(userId, formatted);
  return formatted;
}

/**
 * Fan-out the same notification to many users (e.g. enrolled learners).
 */
async function createNotificationsForUsers(userIds, { type, title, body = '', link = null, meta = null }) {
  const ids = [...new Set((userIds || []).map((id) => String(id)).filter(Boolean))];
  if (ids.length === 0) return [];

  const docs = await Notification.insertMany(
    ids.map((userId) => ({
      userId,
      type,
      title: String(title).slice(0, 200),
      body: String(body || '').slice(0, 500),
      link: link ? String(link).slice(0, 500) : null,
      meta: meta || null,
    })),
    { ordered: false },
  );

  return docs.map((doc) => {
    const formatted = formatNotification(doc);
    emitToUser(doc.userId, formatted);
    return formatted;
  });
}

async function listForUser(userId, { limit = 40, unreadOnly = false } = {}) {
  const filter = { userId };
  if (unreadOnly) filter.readAt = null;
  const docs = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 40, 1), 100))
    .lean();
  return docs.map(formatNotification);
}

async function unreadCount(userId) {
  return Notification.countDocuments({ userId, readAt: null });
}

async function markRead(userId, notificationId) {
  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, userId, readAt: null },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  return formatNotification(doc);
}

async function markAllRead(userId) {
  const result = await Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return { modified: result.modifiedCount || 0 };
}

/**
 * Notify enrolled learners that a new video was added to a course.
 * Resolves course via chapter → section when courseId is not provided.
 */
async function notifyCourseVideoAdded({
  courseId,
  chapterId,
  videoTitle,
  videoId,
  excludeUserId,
}) {
  try {
    const Chapter = require('../models/Chapter');
    const Section = require('../models/Section');
    const Course = require('../models/Course');
    const LearnerCourses = require('../models/LearnerCourses');
    const mongoose = require('mongoose');

    let resolvedCourseId = courseId ? String(courseId) : null;

    if (!resolvedCourseId && chapterId) {
      const chapter = await Chapter.findById(chapterId).select('section').lean();
      if (chapter?.section) {
        const section = await Section.findById(chapter.section).select('course').lean();
        if (section?.course) resolvedCourseId = String(section.course);
      }
    }

    if (!resolvedCourseId) return [];

    const course = await Course.findById(resolvedCourseId).select('title createdBy').lean();
    const courseTitle = course?.title || 'your course';
    const instructorId = excludeUserId || (course?.createdBy ? String(course.createdBy) : null);

    const cid = resolvedCourseId;
    const courseIdVariants = [cid];
    if (mongoose.Types.ObjectId.isValid(cid)) {
      courseIdVariants.push(new mongoose.Types.ObjectId(cid));
    }

    const docs = await LearnerCourses.find({
      courses: { $elemMatch: { courseId: { $in: courseIdVariants } } },
    })
      .select('userId')
      .lean();

    const learnerIds = [
      ...new Set(
        docs
          .map((d) => d.userId)
          .filter((id) => id && (!instructorId || String(id) !== String(instructorId)))
          .map((id) => String(id)),
      ),
    ];

    if (learnerIds.length === 0) return [];

    const titleLabel = (videoTitle && String(videoTitle).trim()) || 'a new video';
    return createNotificationsForUsers(learnerIds, {
      type: 'course_video_added',
      title: `New video in ${courseTitle}`,
      body: `"${titleLabel}" was added. Continue learning when you're ready.`,
      link: `/view-course/${resolvedCourseId}/watch`,
      meta: {
        courseId: resolvedCourseId,
        chapterId: chapterId ? String(chapterId) : null,
        videoId: videoId ? String(videoId) : null,
      },
    });
  } catch (err) {
    console.error('[notifyCourseVideoAdded]', err.message || err);
    return [];
  }
}

module.exports = {
  createNotification,
  createNotificationsForUsers,
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
  formatNotification,
  notifyCourseVideoAdded,
};
