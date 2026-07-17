const express = require('express');
const router = express.Router();
const { handleCashfreeWebhook } = require('../../controllers/webhooks/cashfreeWebhook.controller');

// Body parsing + rawBody capture is configured in app.js for this mount path.
router.post('/', handleCashfreeWebhook);

module.exports = router;
