const express = require("express");
const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  syncVideoTemplateMetadata,
} = require("../../controllers/instructor-controller/chapterEngagementTemplates.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles("instructor", "admin"));
router.get("/", listTemplates);
router.post("/", createTemplate);
router.post("/sync-video-metadata", syncVideoTemplateMetadata);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

module.exports = router;
