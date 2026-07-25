const cashfree = require('../../helpers/cashfree');
const Course = require('../../models/Course');
const Order = require('../../models/Order');
const User = require('../../models/User');
const PendingPayment = require('../../models/PendingPayment');
const { fulfillCoursePurchase } = require('../../services/paymentFulfillment.service');
const {
  buildMerchantOrderId,
  resolvePurchaseContext,
  markPendingFulfilled,
} = require('../../services/cashfreeOrderContext.service');

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

function amountsMatch(a, b, tolerance = 0.01) {
  return Math.abs(Number(a) - Number(b)) <= tolerance;
}

function normalizeIndianPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  return null;
}

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

    const amount = Number(priceINR.toFixed(2));
    const orderId = buildMerchantOrderId(courseId, userId);
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

    customerPhone = normalizeIndianPhone(customerPhone);
    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'A valid Indian phone number is required before checkout.',
      });
    }

    await PendingPayment.findOneAndUpdate(
      { orderId },
      {
        orderId,
        userId,
        courseId: String(courseId),
        amountINR: amount,
        currency: 'INR',
        displayCurrency: displayCurrency || 'INR',
        displayAmount: displayAmount != null ? Number(displayAmount) : amount,
        status: 'pending',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Local mock: no Cashfree credentials required; client verifies immediately.
    if (cashfree.isMockMode()) {
      const paymentSessionId = `mock_session_${orderId}`;
      console.warn('[Cashfree] MOCK create-order — not calling Cashfree API');
      return res.json({
        success: true,
        mock: true,
        orderId,
        paymentSessionId,
        cfOrderId: orderId,
        amount: amount * 100,
        currency: 'INR',
        courseTitle: course.title,
        courseThumbnail: course.thumbnail || '',
        priceINR,
        displayCurrency: displayCurrency || 'INR',
        displayAmount: displayAmount || priceINR,
        returnUrl,
      });
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
        courseId: String(courseId),
        userId,
      },
      returnUrl,
      notifyUrl,
    });

    // Always return our merchant orderId so verify/webhook can resolve PendingPayment.
    res.json({
      success: true,
      orderId,
      paymentSessionId: cfOrder.payment_session_id,
      cfOrderId: cfOrder.cf_order_id || cfOrder.order_id || orderId,
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

    // Never forward Cashfree's 401 as our HTTP 401 — the client treats 401 as a
    // session expiry and tries /auth/refresh, which looks like "authentication Failed".
    if (err.code === 'cashfree_not_configured' || err.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: err.message || 'Cashfree is not configured on the server.',
      });
    }

    const cfType = err.response?.data?.type;
    const cfMessage = err.response?.data?.message || err.message;
    if (
      err.response?.status === 401 ||
      cfType === 'authentication_error' ||
      /authentication failed/i.test(String(cfMessage || ''))
    ) {
      return res.status(502).json({
        success: false,
        message:
          'Cashfree API authentication failed. Check CASHFREE_APP_ID / CASHFREE_SECRET_KEY and that CASHFREE_ENV matches the key type (sandbox vs production).',
      });
    }

    const status =
      err.response?.status && err.response.status >= 400 && err.response.status < 500
        ? err.response.status
        : 500;
    // Avoid leaking provider 401-shaped statuses; map other 4xx through as-is.
    const safeStatus = status === 401 ? 502 : status;
    res.status(safeStatus).json({
      success: false,
      message: cfMessage || 'Failed to create payment order',
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
      if (String(existingOrder.courseId) !== String(courseId)) {
        return res.status(400).json({ success: false, message: 'Payment does not match this course' });
      }
      return res.json({ success: true, message: 'Payment already verified', orderId: existingOrder._id });
    }

    // Local mock checkout: fulfill from PendingPayment without calling Cashfree.
    const isMockSession =
      cashfree.isMockMode() &&
      typeof paymentSessionId === 'string' &&
      paymentSessionId.startsWith('mock_session_');
    if (isMockSession) {
      const pending = await PendingPayment.findOne({ orderId }).lean();
      if (!pending || String(pending.userId) !== userId) {
        return res.status(400).json({ success: false, message: 'Mock payment session is invalid or expired' });
      }
      if (String(pending.courseId) !== String(courseId)) {
        return res.status(400).json({ success: false, message: 'Payment does not match this course' });
      }

      const { order } = await fulfillCoursePurchase({
        userId,
        courseId: String(courseId),
        paymentId: orderId,
        providerOrderId: paymentSessionId,
        displayCurrency: displayCurrency || pending.displayCurrency,
        displayAmount: displayAmount != null ? displayAmount : pending.displayAmount,
      });
      await markPendingFulfilled(orderId);
      console.warn('[Cashfree] MOCK verify — enrolled without Cashfree');
      return res.json({
        success: true,
        mock: true,
        message: 'Mock payment verified and enrollment confirmed',
        orderId: order._id,
      });
    }

    let cfOrder;
    try {
      cfOrder = await cashfree.getOrder(orderId);
    } catch (err) {
      console.error('[Cashfree] verify fetch order:', err.response?.data || err.message || err);
      return res.status(400).json({ success: false, message: 'Could not load payment order' });
    }

    const context = await resolvePurchaseContext(orderId, cfOrder);
    if (!context) {
      return res.status(400).json({ success: false, message: 'Could not resolve payment order context' });
    }

    if (String(context.userId) !== userId) {
      return res.status(403).json({ success: false, message: 'Payment is associated with another account' });
    }
    if (String(context.courseId) !== String(courseId)) {
      return res.status(400).json({ success: false, message: 'Payment does not match this course' });
    }

    const cfCustomerId = cfOrder?.customer_details?.customer_id;
    if (cfCustomerId && String(cfCustomerId) !== userId) {
      return res.status(403).json({ success: false, message: 'Payment customer does not match the signed-in user' });
    }

    const course = await Course.findById(context.courseId).lean();
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

    const expectedAmount = context.amountINR != null ? Number(context.amountINR) : priceINR;
    if (!amountsMatch(expectedAmount, priceINR)) {
      return res.status(400).json({ success: false, message: 'Payment amount does not match course price' });
    }

    const cfAmount = Number(cfOrder?.order_amount ?? cfOrder?.order?.order_amount);
    if (Number.isFinite(cfAmount) && !amountsMatch(cfAmount, expectedAmount)) {
      console.error('[Cashfree] verify amount mismatch', { orderId, cfAmount, expectedAmount });
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    const cfCurrency = String(cfOrder?.order_currency || cfOrder?.order?.order_currency || 'INR').toUpperCase();
    if (cfCurrency && cfCurrency !== 'INR') {
      return res.status(400).json({ success: false, message: 'Unsupported payment currency' });
    }

    const orderStatus = String(cfOrder?.order_status || cfOrder?.order?.order_status || '').toUpperCase();
    const isPaid = ['PAID', 'SUCCESS', 'COMPLETED'].includes(orderStatus);
    if (!isPaid) {
      return res.status(202).json({
        success: false,
        message: 'Payment is still pending or was not completed.',
        paymentStatus: orderStatus || 'PENDING',
      });
    }

    const { order } = await fulfillCoursePurchase({
      userId: context.userId,
      courseId: context.courseId,
      paymentId: orderId,
      providerOrderId: paymentSessionId || orderId,
      displayCurrency: displayCurrency || context.displayCurrency,
      displayAmount: displayAmount != null ? displayAmount : context.displayAmount,
    });

    await markPendingFulfilled(orderId);

    res.json({ success: true, message: 'Payment verified and enrollment confirmed', orderId: order._id });
  } catch (err) {
    console.error('[Cashfree] verify error:', err);
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    res.status(status).json({ success: false, message: err.message || 'Payment verification failed' });
  }
}

function getPaymentMode(_req, res) {
  const keyId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '').trim();
  const envName = String(process.env.CASHFREE_ENV || '').trim().toLowerCase();
  const mock = cashfree.isMockMode();
  const testMode = mock || !keyId || keyId.includes('test') || envName !== 'production';
  res.json({ success: true, testMode, mock });
}

module.exports = { createOrder, verifyPayment, getPaymentMode, normalizeIndianPhone };
