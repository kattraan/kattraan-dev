const crypto = require('crypto');
const cashfree = require('../../helpers/cashfree');
const Course = require('../../models/Course');
const { fulfillCoursePurchase } = require('../../services/paymentFulfillment.service');
const {
  resolvePurchaseContext,
  markPendingFulfilled,
} = require('../../services/cashfreeOrderContext.service');

const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Cashfree signs: HMAC-SHA256(timestamp + rawBody, clientSecret) → base64
 * Headers: x-webhook-signature, x-webhook-timestamp
 * @see https://www.cashfree.com/docs/payments/online/webhooks/signature-verification
 */
function verifyCashfreeWebhookSignature(rawBody, signature, timestamp) {
  const secret = (
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET ||
    ''
  ).trim();

  if (!secret) {
    const err = new Error('CASHFREE_SECRET_KEY is not configured');
    err.statusCode = 500;
    throw err;
  }

  if (!signature || !timestamp || rawBody == null || rawBody === '') {
    const err = new Error('Missing webhook signature or timestamp');
    err.statusCode = 401;
    throw err;
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) {
    const err = new Error('Invalid webhook timestamp');
    err.statusCode = 401;
    throw err;
  }

  const tsMs = tsNum < 1e12 ? tsNum * 1000 : tsNum;
  if (Math.abs(Date.now() - tsMs) > WEBHOOK_TIMESTAMP_TOLERANCE_MS) {
    const err = new Error('Webhook timestamp outside allowed window');
    err.statusCode = 401;
    throw err;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(String(timestamp) + String(rawBody))
    .digest('base64');

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(String(signature));
  if (
    expectedBuf.length !== receivedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 401;
    throw err;
  }
}

function amountsMatch(a, b, tolerance = 0.01) {
  return Math.abs(Number(a) - Number(b)) <= tolerance;
}

async function handleCashfreeWebhook(req, res) {
  try {
    const signature = req.get('x-webhook-signature');
    const timestamp = req.get('x-webhook-timestamp');
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req.rawBody)
          ? req.rawBody.toString('utf8')
          : '';

    try {
      verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
    } catch (verifyErr) {
      const status = verifyErr.statusCode || 401;
      console.error('[Cashfree webhook] signature verification failed:', verifyErr.message);
      return res.status(status).json({ success: false, message: verifyErr.message });
    }

    const event = req.body || {};
    const orderId =
      event.order?.order_id ||
      event.data?.order?.order_id ||
      event.order?.cf_order_id ||
      event.data?.order?.cf_order_id;
    const paymentStatus =
      event.type ||
      event.order?.order_status ||
      event.data?.order?.order_status;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing order id' });
    }

    if (!paymentStatus || !/SUCCESS|PAID|COMPLETED/i.test(String(paymentStatus))) {
      return res.json({ success: true, ignored: true });
    }

    const payload = event.order || event.data?.order || {};
    let context = await resolvePurchaseContext(orderId, payload);

    // If webhook order id differs from merchant id, try fetching the CF order.
    if (!context) {
      try {
        const cfOrder = await cashfree.getOrder(orderId);
        context = await resolvePurchaseContext(orderId, cfOrder);
        if (!context && cfOrder?.order_id && cfOrder.order_id !== orderId) {
          context = await resolvePurchaseContext(cfOrder.order_id, cfOrder);
        }
      } catch (fetchErr) {
        console.error('[Cashfree webhook] fetch order failed:', fetchErr.message);
      }
    }

    if (!context?.userId || !context?.courseId) {
      console.error('[Cashfree webhook] missing purchase context', { orderId });
      return res.status(400).json({ success: false, message: 'Could not resolve course/user for payment' });
    }

    const course = await Course.findById(context.courseId).select('price status isDeleted').lean();
    if (!course || course.isDeleted || course.status !== 'published') {
      console.error('[Cashfree webhook] invalid course', { orderId, courseId: context.courseId });
      return res.status(400).json({ success: false, message: 'Course not available for purchase' });
    }

    const priceINR = Number(course.price) || 0;
    const expectedAmount = context.amountINR != null ? Number(context.amountINR) : priceINR;
    if (priceINR <= 0 || !amountsMatch(expectedAmount, priceINR)) {
      console.error('[Cashfree webhook] amount/course mismatch', {
        orderId,
        expectedAmount,
        priceINR,
      });
      return res.status(400).json({ success: false, message: 'Payment amount does not match course price' });
    }

    const paidAmount = Number(payload.order_amount);
    if (Number.isFinite(paidAmount) && !amountsMatch(paidAmount, expectedAmount)) {
      console.error('[Cashfree webhook] paid amount mismatch', { orderId, paidAmount, expectedAmount });
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    await fulfillCoursePurchase({
      userId: context.userId,
      courseId: context.courseId,
      paymentId: context.orderId || orderId,
      providerOrderId: orderId,
      displayCurrency: context.displayCurrency || 'INR',
      displayAmount: context.displayAmount != null ? context.displayAmount : expectedAmount,
    });

    await markPendingFulfilled(context.orderId || orderId);

    res.json({ success: true });
  } catch (err) {
    console.error('[Cashfree webhook] error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
}

module.exports = { handleCashfreeWebhook, verifyCashfreeWebhookSignature };
