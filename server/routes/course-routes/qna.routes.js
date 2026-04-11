const express = require("express");
const router = express.Router();
const qnaController = require("../../controllers/course-controller/qna.controller");
const authenticate = require("../../middleware/auth-middleware");
const authorizeRoles = require("../../middleware/role-middleware");
const { createQnaQuestion, updateQnaQuestion, listQnaQuestions, addReply, deleteQuestion, deleteReply } = require("../../validations/qna");

router.use(authenticate);

// Learners, instructors and admins can view questions
router.get("/", authorizeRoles("learner", "instructor", "admin"), listQnaQuestions, qnaController.getQuestions);

// Learners (and optionally instructors/admins) can create questions
router.post(
  "/",
  authorizeRoles("learner", "instructor", "admin"),
  createQnaQuestion,
  qnaController.createQuestion
);

// Instructors/admins can update status/title/description if needed
router.patch(
  "/:id",
  authorizeRoles("instructor", "admin"),
  updateQnaQuestion,
  qnaController.updateQuestion
);

// Anyone authenticated can add a reply (learner, instructor, admin)
router.post(
  "/:id/replies",
  authorizeRoles("learner", "instructor", "admin"),
  addReply,
  qnaController.addReply
);

router.delete(
  "/:id",
  authorizeRoles("learner", "instructor", "admin"),
  deleteQuestion,
  qnaController.deleteQuestion
);

router.delete(
  "/:id/replies/:replyId",
  authorizeRoles("learner", "instructor", "admin"),
  deleteReply,
  qnaController.deleteReply
);

module.exports = router;

