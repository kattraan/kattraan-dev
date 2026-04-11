const express = require("express");
const {
  getMyAssignments,
  submitAssignment,
  getAssignmentSubmissionForContent,
} = require("../../controllers/learner-controller/learnerAssignmentsController");
const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("learner", "instructor", "admin"));

router.get("/", getMyAssignments);
router.get("/by-content/:contentId", getAssignmentSubmissionForContent);
router.post("/:contentId/submit", submitAssignment);

module.exports = router;
