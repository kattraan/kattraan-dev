const crypto = require('crypto');
const razorpay = require('../../helpers/razorpay');
const Course = require('../../models/Course');
const Order = require('../../models/Order');
const LearnerCourses = require('../../models/LearnerCourses');
const Chapter = require('../../models/Chapter');

/**
 * POST /api/payment/razorpay/create-order
 * Creates a Razorpay order for the given course.
 * Amount is always in INR (paise = INR * 100).
 *
 * Body: { courseId, displayCurrency?, displayAmount? }
 * Returns: { orderId, amount, currency, keyId, courseTitle }
 */
async function createOrder(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId, displayCurrency, displayAmount } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const course = await Course.findById(courseId).lean();
    if (!course || course.isDeleted) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Course is not available for purchase' });
    }

    const priceINR = Number(course.price) || 0;
    if (priceINR === 0) {
      return res.status(400).json({ success: false, message: 'This course is free — use the enroll endpoint instead' });
    }

    // Razorpay amount is in the smallest currency unit (paise for INR)
    const amountPaise = Math.round(priceINR * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `course_${courseId}_user_${userId}_${Date.now()}`,
      notes: {
        courseId,
        userId,
        courseTitle: course.title,
      },
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail || '',
      priceINR,
      displayCurrency: displayCurrency || 'INR',
      displayAmount: displayAmount || priceINR,
    });
  } catch (err) {
    console.error('[Razorpay] create-order error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  }
}

/**
 * POST /api/payment/razorpay/verify
 * Verifies the Razorpay payment signature, creates an Order record,
 * and enrolls the user in the course.
 *
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   courseId, displayCurrency?, displayAmount?
 * }
 */
async function verifyPayment(req, res) {
  try {
    const userId = req.user._id.toString();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      displayCurrency,
      displayAmount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    // Fetch course details
    const course = await Course.findById(courseId)
      .populate('createdBy', 'userName _id')
      .lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled (idempotency)
    let learnerDoc = await LearnerCourses.findOne({ userId });
    if (!learnerDoc) {
      learnerDoc = new LearnerCourses({ userId, courses: [] });
    }
    const alreadyEnrolled = learnerDoc.courses.some(
      (c) => c.courseId && c.courseId.toString() === courseId.toString()
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

    // Save order record
    const order = new Order({
      userId,
      userName: req.user.userName || req.user.name || '',
      userEmail: req.user.email || '',
      orderStatus: 'confirmed',
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      orderDate: new Date(),
      paymentId: razorpay_payment_id,
      payerId: razorpay_order_id,
      instructorId: course.createdBy?._id?.toString() || '',
      instructorName: course.createdBy?.userName || 'Instructor',
      courseImage: course.thumbnail || '',
      courseTitle: course.title || '',
      courseId: course._id.toString(),
      coursePricing: Number(course.price) || 0,
      currency: 'INR',
      displayAmount: displayAmount || Number(course.price) || 0,
      displayCurrency: displayCurrency || 'INR',
    });
    await order.save();

    res.json({ success: true, message: 'Payment verified and enrollment confirmed', orderId: order._id });
  } catch (err) {
    console.error('[Razorpay] verify error:', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
}

module.exports = { createOrder, verifyPayment };
