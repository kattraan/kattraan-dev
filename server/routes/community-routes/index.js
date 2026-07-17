const express = require("express");
const path = require("path");
const router = express.Router();
const { body, param } = require("express-validator");

const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const validateRequest = require("../../middleware/validateRequest");
const { requireCommunityOwner, requireCommunityMember } = require("../../middleware/communityOwnership");
const { createHardenedUpload, handleUploadErrors } = require("../../config/uploadSecurity");

const {
  createCommunity,
  listCommunities,
  getCommunity,
  updateCommunity,
  archiveCommunity,
  joinCommunity,
  leaveCommunity,
  listJoinRequests,
  decideJoinRequest,
  listMembers,
  removeMember,
  getMessages,
  searchMessages,
  getPinnedMessages,
  uploadAttachment,
} = require("../../controllers/community-controller");

router.use(authenticate);

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const upload = createHardenedUpload({
  uploadsDir: UPLOADS_DIR,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  maxFiles: 1,
});

const idCheck = param("id").isMongoId().withMessage("Invalid community ID");
const userIdCheck = param("userId").isMongoId().withMessage("Invalid user ID");
const validateId = [idCheck, validateRequest];

// POST /api/community — create a community for a course (instructor: own course, or admin)
router.post(
  "/",
  authorizeRoles("instructor", "admin"),
  [
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("name").trim().notEmpty().withMessage("Community name is required").isLength({ max: 100 }),
  ],
  validateRequest,
  createCommunity
);

// GET /api/community — role-scoped list
router.get("/", listCommunities);

// GET /api/community/:id — detail
router.get("/:id", validateId, getCommunity);

// PATCH /api/community/:id — update (owner/admin)
router.patch(
  "/:id",
  [idCheck, body("name").optional().trim().notEmpty().withMessage("Community name cannot be empty").isLength({ max: 100 })],
  validateRequest,
  requireCommunityOwner(),
  updateCommunity
);

// DELETE /api/community/:id — archive/soft-delete (owner/admin)
router.delete("/:id", validateId, requireCommunityOwner(), archiveCommunity);

// POST /api/community/:id/join — request to join
router.post("/:id/join", validateId, joinCommunity);

// POST /api/community/:id/leave — leave a community (self-service, not for owners)
router.post("/:id/leave", validateId, leaveCommunity);

// GET /api/community/:id/requests — pending join requests (owner/admin)
router.get("/:id/requests", validateId, requireCommunityOwner(), listJoinRequests);

// PATCH /api/community/:id/requests/:userId — approve/reject (owner/admin)
router.patch(
  "/:id/requests/:userId",
  [idCheck, userIdCheck, body("action").isIn(["approve", "reject"]).withMessage("action must be 'approve' or 'reject'")],
  validateRequest,
  requireCommunityOwner(),
  decideJoinRequest
);

// GET /api/community/:id/members — approved member list
router.get("/:id/members", validateId, requireCommunityMember(), listMembers);

// DELETE /api/community/:id/members/:userId — remove member (owner/admin)
router.delete(
  "/:id/members/:userId",
  [idCheck, userIdCheck],
  validateRequest,
  requireCommunityOwner(),
  removeMember
);

// GET /api/community/:id/messages — paginated history (member/owner/admin)
router.get("/:id/messages", validateId, requireCommunityMember(), getMessages);

// GET /api/community/:id/messages/search?q=... — search message history (member/owner/admin)
router.get("/:id/messages/search", validateId, requireCommunityMember(), searchMessages);

// GET /api/community/:id/messages/pinned — pinned messages (member/owner/admin)
router.get("/:id/messages/pinned", validateId, requireCommunityMember(), getPinnedMessages);

// POST /api/community/:id/attachments — upload a chat attachment (member/owner/admin)
router.post(
  "/:id/attachments",
  validateId,
  requireCommunityMember(),
  upload.single("file"),
  uploadAttachment
);

// Convert multer/file-filter rejections into clean 400s.
router.use(handleUploadErrors);

module.exports = router;
