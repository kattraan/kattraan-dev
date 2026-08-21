const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const validateRequest = require("../../middleware/validateRequest");
const {
  listPublicBlogs,
  getPublicBlog,
  listPublicTestimonials,
} = require("../../controllers/site-controller/siteContentPublic.controller");

router.get("/blogs", listPublicBlogs);
router.get(
  "/blogs/:id",
  [param("id").isMongoId().withMessage("Invalid article ID"), validateRequest],
  getPublicBlog
);
router.get("/testimonials", listPublicTestimonials);

module.exports = router;
