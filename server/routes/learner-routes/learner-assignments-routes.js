const express = require("express");
const path = require("path");
const {
  getMyAssignments,
  submitAssignment,
  uploadAssignmentFile,
  getAssignmentSubmissionForContent,
  getAssignmentSummariesByContentIds,
} = require("../../controllers/learner-controller/learnerAssignmentsController");
const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const { createHardenedUpload, handleUploadErrors } = require("../../config/uploadSecurity");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("learner", "instructor", "admin"));

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const upload = createHardenedUpload({
  uploadsDir: UPLOADS_DIR,
  maxFileSizeBytes: 50 * 1024 * 1024,
  maxFiles: 1,
});

router.get("/", getMyAssignments);
router.get("/summaries", getAssignmentSummariesByContentIds);
router.get("/by-content/:contentId", getAssignmentSubmissionForContent);
router.post("/:contentId/submit", submitAssignment);
router.post(
  "/:contentId/upload",
  upload.single("file"),
  uploadAssignmentFile
);
router.use(handleUploadErrors);

module.exports = router;
