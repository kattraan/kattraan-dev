const Course = require('../models/Course');
const Order = require('../models/Order');
const LearnerCourses = require('../models/LearnerCourses');
const Chapter = require('../models/Chapter');
const User = require('../models/User');

/**
 * Enroll user and persist Order for a successful Razorpay payment.
 * Idempotent on paymentId (same Razorpay payment never creates two orders or double-enrolls).
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.courseId
 * @param {string} params.paymentId - Razorpay payment id (pay_...)
 * @param {string} params.razorpayOrderId - Razorpay order id (order_...)
 * @param {string} [params.displayCurrency]
 * @param {number} [params.displayAmount]
 * @returns {Promise<{ idempotent: boolean, order: object }>}
 */
async function fulfillCoursePurchase(params) {
  const {
    userId,
    courseId,
    paymentId,
    razorpayOrderId,
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

  let learnerDoc = await LearnerCourses.findOne({ userId });
  if (!learnerDoc) {
    learnerDoc = new LearnerCourses({ userId, courses: [] });
  }
  const alreadyEnrolled = learnerDoc.courses.some(
    (c) => c.courseId && c.courseId.toString() === courseId.toString(),
  );

  if (!alreadyEnrolled) {
    const sectionIds = (course.sections || []).map((s) => s && s.toString()).filter(Boolean);
    const totalLessons = sectionIds.length
      ? await Chapter.countDocuments({ section: { $in: sectionIds }, isDeleted: { $ne: true } })
      : 0;

    const instructorName = course.createdBy?.userName || 'Instructor';
    learnerDoc.courses.push({
      courseId: course._id.toString(),
      title: course.title || 'Untitled Course',
      instructorId: course.createdBy?._id?.toString() || '',
      instructorName,
      dateOfPurchase: new Date(),
      courseImage: course.thumbnail || '',
      totalLessons,
    });
    await learnerDoc.save();
    await Course.findByIdAndUpdate(courseId, { $inc: { learners: 1 } });
  }

  const orderPayload = {
    userId,
    userName,
    userEmail,
    orderStatus: 'confirmed',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderDate: new Date(),
    paymentId,
    payerId: razorpayOrderId,
    instructorId: course.createdBy?._id?.toString() || '',
    instructorName: course.createdBy?.userName || 'Instructor',
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

  try {
    const order = await Order.create(orderPayload);
    return { idempotent: false, order: order.toObject() };
  } catch (err) {
    if (err.code === 11000) {
      const dup = await Order.findOne({ paymentId }).lean();
      if (dup) return { idempotent: true, order: dup };
    }
    throw err;
  }
}

module.exports = { fulfillCoursePurchase };
