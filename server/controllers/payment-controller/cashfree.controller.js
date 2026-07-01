const crypto = require('crypto');
const cashfree = require('../../helpers/cashfree');
const Course = require('../../models/Course');
const Order = require('../../models/Order');
const User = require('../../models/User');
const { fulfillCoursePurchase } = require('../../services/razorpayFulfillment.service');

function normalizeBaseUrl(rawValue, fallback) {
  const value = (rawValue || fallback || '').trim();
  if (!value) {
    return fallback;
  }

  try {
    const parsed = new URL(value);
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    if (!isLocalhost) {
      parsed.protocol = 'https:';
    }
    return parsed.origin;
  } catch (err) {
    return value.replace(/^http:/i, 'https:').replace(/\/$/, '');
  }
}

function buildCashfreeCallbackUrls(courseId, orderId) {
  const frontendBase = normalizeBaseUrl(
    process.env.CASHFREE_RETURN_URL || process.env.CLIENT_URL || process.env.FRONTEND_URL,
    'https://localhost:5173',
  );
  const apiBase = normalizeBaseUrl(
    process.env.CASHFREE_NOTIFY_URL || process.env.API_URL || process.env.BASE_URL,
    'https://localhost:5000',
  );

  return {
    returnUrl: `${frontendBase.replace(/\/$/, '')}/checkout/${courseId}?payment=success&orderId=${encodeURIComponent(orderId)}`,
    notifyUrl: `${apiBase.replace(/\/$/, '')}/api/webhooks/cashfree`,
  };
}

async function createOrder(req, res) {
  try {
    const userId = req.user._id.toString();
    const { courseId, displayCurrency, displayAmount } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId is required' });
    }

    const courseDoc = await Course.findById(courseId);
    const course = courseDoc?.lean ? await courseDoc.lean() : courseDoc;
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

    const amount = Number(priceINR.toFixed(2));
    const orderId = `kattraan-${courseId}-${userId}-${Date.now()}`;
    const { returnUrl, notifyUrl } = buildCashfreeCallbackUrls(courseId, orderId);

    let customerPhone = req.user.phoneNumber || req.user.phone || req.user.mobile || '';
    let customerEmail = req.user.userEmail || req.user.email || '';
    let customerName = req.user.userName || req.user.name || '';

    if (!customerPhone || !customerEmail || !customerName) {
      const userDoc = await User.findById(userId).select('phoneNumber userEmail userName name email').lean();
      customerPhone = customerPhone || userDoc?.phoneNumber || '';
      customerEmail = customerEmail || userDoc?.userEmail || userDoc?.email || '';
      customerName = customerName || userDoc?.userName || userDoc?.name || '';
    }

    const normalizedPhone = String(customerPhone || '').replace(/\D/g, '');
    if (normalizedPhone.length === 10) {
      customerPhone = `+91${normalizedPhone}`;
    } else if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
      customerPhone = `+${normalizedPhone}`;
    } else if (normalizedPhone.length > 10) {
      customerPhone = `+${normalizedPhone}`;
    } else {
      customerPhone = '+919999999999';
    }

    const cfOrder = await cashfree.createOrder({
      orderId,
      amount,
      currency: 'INR',
      customerDetails: {
        customer_id: userId,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_name: customerName,
      },
      notes: {
        orderNote: `${course.title} purchase`,
        courseId,
        userId,
      },
      returnUrl,
      notifyUrl,
    });

    res.json({
      success: true,
      orderId: cfOrder.cf_order_id || cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      amount: amount * 100,
      currency: 'INR',
      courseTitle: course.title,
      courseThumbnail: course.thumbnail || '',
      priceINR,
      displayCurrency: displayCurrency || 'INR',
      displayAmount: displayAmount || priceINR,
    });
  } catch (err) {
    console.error('[Cashfree] create-order error:', err.response?.data || err.message || err);
    const desc = err.response?.data?.message || err.message;
    const status = err.response?.status && err.response.status >= 400 && err.response.status < 500 ? err.response.status : 500;
    res.status(status).json({
      success: false,
      message: desc || 'Failed to create payment order',
    });
  }
}

async function verifyPayment(req, res) {
  try {
    const userId = req.user._id.toString();
    const { orderId, paymentSessionId, courseId, displayCurrency, displayAmount } = req.body;

    if (!orderId || !courseId) {
      return res.status(400).json({ success: false, message: 'Missing required payment fields' });
    }

    const existingOrder = await Order.findOne({ paymentId: orderId }).lean();
    if (existingOrder) {
      if (String(existingOrder.userId) !== userId) {
        return res.status(403).json({ success: false, message: 'Payment is associated with another account' });
      }
      return res.json({ success: true, message: 'Payment already verified', orderId: existingOrder._id });
    }

    const courseDoc = await Course.findById(courseId);
    const course = courseDoc?.lean ? await courseDoc.lean() : courseDoc;
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

    let cfOrder;
    try {
      cfOrder = await cashfree.getOrder(orderId);
    } catch (err) {
      console.error('[Cashfree] verify fetch order:', err.response?.data || err.message || err);
      return res.status(400).json({ success: false, message: 'Could not load payment order' });
    }

    const orderStatus = String(cfOrder?.order_status || cfOrder?.order?.order_status || '').toUpperCase();
    const isPaid = ['PAID', 'SUCCESS', 'COMPLETED'].includes(orderStatus);
    if (!isPaid) {
      return res.status(202).json({ success: false, message: 'Payment is still pending or was not completed.', paymentStatus: orderStatus || 'PENDING' });
    }

    const { order } = await fulfillCoursePurchase({
      userId,
      courseId,
      paymentId: orderId,
      razorpayOrderId: paymentSessionId || orderId,
      displayCurrency,
      displayAmount,
    });

    res.json({ success: true, message: 'Payment verified and enrollment confirmed', orderId: order._id });
  } catch (err) {
    console.error('[Cashfree] verify error:', err);
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({ success: false, message: err.message || 'Payment verification failed' });
  }
}

function getPaymentMode(_req, res) {
  const keyId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '').trim();
  const testMode = !keyId || keyId.includes('test') || process.env.CASHFREE_ENV !== 'production';
  res.json({ success: true, testMode });
}

module.exports = { createOrder, verifyPayment, getPaymentMode };
