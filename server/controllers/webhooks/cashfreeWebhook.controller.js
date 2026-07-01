const { fulfillCoursePurchase } = require('../../services/razorpayFulfillment.service');

async function handleCashfreeWebhook(req, res) {
  try {
    const event = req.body || {};
    const orderId = event.order?.order_id || event.order?.cf_order_id || event.data?.order?.order_id;
    const paymentStatus = event.type || event.order?.order_status || event.data?.order?.order_status;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing order id' });
    }

    if (paymentStatus && /SUCCESS|PAID|COMPLETED/i.test(paymentStatus)) {
      const payload = event.order || event.data?.order || {};
      const courseId = payload.notes?.courseId || payload.order_note?.match(/courseId:(.+)/)?.[1];
      const userId = payload.notes?.userId;
      if (courseId && userId) {
        await fulfillCoursePurchase({
          userId,
          courseId,
          paymentId: orderId,
          razorpayOrderId: orderId,
          displayCurrency: 'INR',
          displayAmount: payload.order_amount,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Cashfree webhook] error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
}

module.exports = { handleCashfreeWebhook };
