const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const {
  submitFeedback,
} = require("../../controllers/learner-controller/chapterEngagementFeedback.controller");

const router = express.Router();

router.post("/feedback", authenticate, submitFeedback);

module.exports = router;
