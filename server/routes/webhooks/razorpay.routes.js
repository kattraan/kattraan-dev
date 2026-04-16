const express = require('express');
const { handleRazorpayWebhook } = require('../../controllers/webhooks/razorpayWebhook.controller');

const router = express.Router();

/**
 * Razorpay Dashboard → Webhooks → URL:
 * https://<api-host>/api/webhooks/razorpay
 * Subscribe to: payment.captured (fulfillment), payment.failed (structured logs).
 */
router.post('/', handleRazorpayWebhook);

module.exports = router;
