const crypto = require('crypto');
const razorpay = require('../../helpers/razorpay');
const { fulfillCoursePurchase } = require('../../services/razorpayFulfillment.service');

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    const err = new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
    err.statusCode = 500;
    throw err;
  }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!signature || expected !== signature) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 400;
    throw err;
  }
}

/**
 * POST /api/webhooks/razorpay
 * Raw JSON body (mounted with express.raw).
 * - payment.captured: fulfill course purchase (idempotent).
 * - payment.failed: structured console.warn only.
 */
async function handleRazorpayWebhook(req, res) {
  const signature = req.get('x-razorpay-signature');
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '', 'utf8');

  try {
    verifyWebhookSignature(rawBody, signature);
  } catch (e) {
    if (e.statusCode === 400) {
      return res.status(400).json({ success: false, message: e.message });
    }
    console.error('[Razorpay webhook] configuration error:', e.message);
    return res.status(500).json({ success: false, message: 'Webhook misconfigured' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }

  const event = payload.event;

  if (event === 'payment.failed') {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || '';
    const paymentId = paymentEntity?.id || '';
    const errorCode = paymentEntity?.error_code || '';
    const errorDescription = paymentEntity?.error_description || '';
    const method = paymentEntity?.method || '';
    console.warn('[Razorpay webhook] payment.failed', {
      event,
      paymentId,
      orderId,
      errorCode,
      errorDescription,
      method,
      status: paymentEntity?.status,
    });
    return res.status(200).json({ success: true, logged: true, event });
  }

  if (event !== 'payment.captured') {
    return res.status(200).json({ success: true, ignored: true, event });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  if (!paymentEntity?.id || !paymentEntity.order_id) {
    return res.status(400).json({ success: false, message: 'Missing payment payload' });
  }

  const paymentId = paymentEntity.id;
  const orderId = paymentEntity.order_id;

  try {
    const order = await razorpay.orders.fetch(orderId);
    const notes = order.notes || {};
    const userId = notes.userId != null ? String(notes.userId) : '';
    const courseId = notes.courseId != null ? String(notes.courseId) : '';

    if (!userId || !courseId) {
      console.error('[Razorpay webhook] order missing notes', { orderId, paymentId });
      return res.status(200).json({ success: true, skipped: true, reason: 'missing_notes' });
    }

    const orderAmount = Number(order.amount);
    const payAmount = Number(paymentEntity.amount);
    if (payAmount !== orderAmount || order.currency !== 'INR' || paymentEntity.currency !== 'INR') {
      console.error('[Razorpay webhook] amount/currency mismatch', { orderId, paymentId });
      return res.status(200).json({ success: true, skipped: true, reason: 'amount_mismatch' });
    }

    await fulfillCoursePurchase({
      userId,
      courseId,
      paymentId,
      razorpayOrderId: orderId,
      displayCurrency: 'INR',
      displayAmount: orderAmount / 100,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Razorpay webhook] fulfill error:', err.message);
    return res.status(500).json({ success: false, message: 'Fulfillment failed' });
  }
}

module.exports = { handleRazorpayWebhook };
