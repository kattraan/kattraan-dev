const express = require('express');
const { handleBunnyStreamWebhook } = require('../../controllers/webhooks/bunnyStreamWebhook.controller');

const router = express.Router();

/**
 * Bunny Stream calls this URL when video encoding status changes.
 * No authentication: request is validated via VideoLibraryId match.
 * Configure this URL in Bunny dashboard: Stream → Library → Webhooks.
 */
router.post('/bunny-stream', handleBunnyStreamWebhook);

module.exports = router;
