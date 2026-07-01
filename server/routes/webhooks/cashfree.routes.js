const express = require('express');
const router = express.Router();
const { handleCashfreeWebhook } = require('../../controllers/webhooks/cashfreeWebhook.controller');

router.post('/', express.json({ type: () => true }), handleCashfreeWebhook);

module.exports = router;
