const crypto = require('crypto');
const razorpay = require('../../helpers/razorpay');
const Course = require('../../models/Course');
const Order = require('../../models/Order');
const { fulfillCoursePurchase } = require('../../services/razorpayFulfillment.service');

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

    const amountPaise = Math.round(priceINR * 100);

    // Razorpay receipt max length is 40; courseId + userId + timestamp exceed that.
    const receipt = crypto
      .createHash('sha256')
      .update(`${courseId}|${userId}|${Date.now()}|${Math.random()}`)
      .digest('hex')
      .slice(0, 40);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
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
    const desc = err.error?.description || err.description;
    const status = err.statusCode >= 400 && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({
      success: false,
      message: desc || err.message || 'Failed to create payment order',
    });
  }
}

/**
 * POST /api/payment/razorpay/verify
 * Verifies the Razorpay payment signature, validates order against DB course price,
 * then enrolls and creates an Order (idempotent on payment id).
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

    const existingOrder = await Order.findOne({ paymentId: razorpay_payment_id }).lean();
    if (existingOrder) {
      if (String(existingOrder.userId) !== userId) {
        return res.status(403).json({ success: false, message: 'Payment is associated with another account' });
      }
      return res.json({
        success: true,
        message: 'Payment already verified',
        orderId: existingOrder._id,
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
    }

    let rzOrder;
    try {
      rzOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (e) {
      console.error('[Razorpay] verify fetch order:', e.message);
      return res.status(400).json({ success: false, message: 'Could not load payment order' });
    }

    const notes = rzOrder.notes || {};
    if (String(notes.userId || '') !== userId) {
      return res.status(400).json({ success: false, message: 'Order does not belong to this account' });
    }
    if (String(notes.courseId || '') !== String(courseId)) {
      return res.status(400).json({ success: false, message: 'Order does not match this course' });
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

    const expectedPaise = Math.round(priceINR * 100);
    if (Number(rzOrder.amount) !== expectedPaise || rzOrder.currency !== 'INR') {
      return res.status(400).json({ success: false, message: 'Order amount does not match course price' });
    }

    const { order } = await fulfillCoursePurchase({
      userId,
      courseId,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      displayCurrency,
      displayAmount,
    });

    res.json({
      success: true,
      message: 'Payment verified and enrollment confirmed',
      orderId: order._id,
    });
  } catch (err) {
    console.error('[Razorpay] verify error:', err);
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({ success: false, message: err.message || 'Payment verification failed' });
  }
}

module.exports = { createOrder, verifyPayment };
