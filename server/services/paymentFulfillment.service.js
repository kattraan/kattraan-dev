const Course = require('../models/Course');
const Order = require('../models/Order');
const LearnerCourses = require('../models/LearnerCourses');
const Chapter = require('../models/Chapter');
const User = require('../models/User');

/**
 * Enroll user and persist Order for a successful Cashfree payment.
 * Idempotent on paymentId (same payment never creates two orders or double-enrolls).
 *
 * Concurrency strategy (works on standalone Mongo and replica sets):
 * 1. Create the Order first using unique paymentId as the lock.
 * 2. Only the creator continues to enroll.
 * 3. Enrollment uses an atomic $ne/$push so learners is incremented at most once.
 */
async function fulfillCoursePurchase(params) {
  const {
    userId,
    courseId,
    paymentId,
    providerOrderId,
    displayCurrency,
    displayAmount,
  } = params;

  const existing = await Order.findOne({ paymentId }).lean();
  if (existing) {
    return { idempotent: true, order: existing };
  }

  const course = await Course.findById(courseId)
    .populate('createdBy', 'userName _id')
    .lean();

  if (!course || course.isDeleted) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  if (course.status !== 'published') {
    const err = new Error('Course is not available for purchase');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId).select('userName userEmail').lean();
  const userName = user?.userName || '';
  const userEmail = user?.userEmail || '';

  const sectionIds = (course.sections || []).map((s) => s && s.toString()).filter(Boolean);
  const totalLessons = sectionIds.length
    ? await Chapter.countDocuments({ section: { $in: sectionIds }, isDeleted: { $ne: true } })
    : 0;

  const instructorName = course.createdBy?.userName || 'Instructor';
  const enrollment = {
    courseId: course._id.toString(),
    title: course.title || 'Untitled Course',
    instructorId: course.createdBy?._id?.toString() || '',
    instructorName,
    dateOfPurchase: new Date(),
    courseImage: course.thumbnail || '',
    totalLessons,
  };

  const orderPayload = {
    userId,
    userName,
    userEmail,
    orderStatus: 'confirmed',
    paymentMethod: 'cashfree',
    paymentStatus: 'paid',
    orderDate: new Date(),
    paymentId,
    payerId: providerOrderId || paymentId,
    instructorId: course.createdBy?._id?.toString() || '',
    instructorName,
    courseImage: course.thumbnail || '',
    courseTitle: course.title || '',
    courseId: course._id.toString(),
    coursePricing: Number(course.price) || 0,
    currency: 'INR',
    displayAmount:
      displayAmount != null && !Number.isNaN(Number(displayAmount))
        ? Number(displayAmount)
        : Number(course.price) || 0,
    displayCurrency: displayCurrency || 'INR',
  };

  let order;
  try {
    // Unique paymentId is the concurrency lock: only one request wins.
    order = await Order.create(orderPayload);
  } catch (err) {
    if (err.code === 11000) {
      const dup = await Order.findOne({ paymentId }).lean();
      if (dup) return { idempotent: true, order: dup };
    }
    throw err;
  }

  // Ensure one LearnerCourses doc per user, then append this course only if absent.
  await LearnerCourses.updateOne(
    { userId },
    { $setOnInsert: { userId, courses: [] } },
    { upsert: true },
  );

  const enrollmentResult = await LearnerCourses.updateOne(
    { userId, 'courses.courseId': { $ne: course._id.toString() } },
    { $push: { courses: enrollment } },
  );

  if (enrollmentResult.modifiedCount === 1) {
    await Course.updateOne({ _id: course._id }, { $inc: { learners: 1 } });
  }

  return { idempotent: false, order: order.toObject() };
}

module.exports = { fulfillCoursePurchase };
