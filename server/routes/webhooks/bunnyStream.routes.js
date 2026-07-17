const express = require('express');
const { handleBunnyStreamWebhook } = require('../../controllers/webhooks/bunnyStreamWebhook.controller');

const router = express.Router();

/**
 * Bunny Stream encoding webhook.
 * Mounted at /api/webhooks/bunny-stream with raw-body capture in app.js.
 * Auth: HMAC signature + library ID match.
 */
router.post('/', handleBunnyStreamWebhook);

module.exports = router;
