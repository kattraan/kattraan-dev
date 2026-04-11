const express = require("express");
const router = express.Router();
const chapterCommentController = require("../../controllers/course-controller/chapterComment.controller");
const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const {
  createComment,
  addReply,
  listComments,
  deleteComment,
  deleteReply,
} = require("../../validations/chapterComment");

router.use(authenticate);

router.get(
  "/",
  authorizeRoles("learner", "instructor", "admin"),
  listComments,
  chapterCommentController.getComments
);

router.post(
  "/",
  authorizeRoles("learner", "instructor", "admin"),
  createComment,
  chapterCommentController.createComment
);

router.post(
  "/:id/replies",
  authorizeRoles("learner", "instructor", "admin"),
  addReply,
  chapterCommentController.addReply
);

router.patch(
  "/:id",
  authorizeRoles("instructor", "admin"),
  chapterCommentController.updateComment
);

router.delete(
  "/:id",
  authorizeRoles("learner", "instructor", "admin"),
  deleteComment,
  chapterCommentController.deleteComment
);

router.delete(
  "/:id/replies/:replyId",
  authorizeRoles("learner", "instructor", "admin"),
  deleteReply,
  chapterCommentController.deleteReply
);

module.exports = router;
