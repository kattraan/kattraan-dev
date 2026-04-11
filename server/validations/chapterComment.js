const { body, param, query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const createComment = [
  body("course").notEmpty().withMessage("Course is required").isMongoId().withMessage("Invalid course id"),
  body("chapter").notEmpty().withMessage("Chapter is required").isMongoId().withMessage("Invalid chapter id"),
  body("text").trim().notEmpty().withMessage("Comment text is required").isLength({ max: 5000 }).withMessage("Comment too long"),
  validateRequest,
];

const addReply = [
  param("id").notEmpty().withMessage("Comment id is required").isMongoId().withMessage("Invalid comment id"),
  body("text").trim().notEmpty().withMessage("Reply text is required").isLength({ max: 5000 }).withMessage("Reply too long"),
  validateRequest,
];

const listComments = [
  query("course").optional().isMongoId().withMessage("Invalid course id"),
  query("chapter").optional().isMongoId().withMessage("Invalid chapter id"),
  query("status").optional().isIn(["read", "unread"]).withMessage("Status must be read or unread"),
  validateRequest,
];

const deleteComment = [
  param("id").notEmpty().withMessage("Comment id is required").isMongoId().withMessage("Invalid comment id"),
  validateRequest,
];

const deleteReply = [
  param("id").notEmpty().withMessage("Comment id is required").isMongoId().withMessage("Invalid comment id"),
  param("replyId").notEmpty().withMessage("Reply id is required").isMongoId().withMessage("Invalid reply id"),
  validateRequest,
];

module.exports = { createComment, addReply, listComments, deleteComment, deleteReply };
