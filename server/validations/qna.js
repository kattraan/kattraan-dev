const { body, param, query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const createQnaQuestion = [
  body("course").notEmpty().withMessage("Course is required").isMongoId().withMessage("Invalid course id"),
  body("chapter").notEmpty().withMessage("Chapter is required").isMongoId().withMessage("Invalid chapter id"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
  validateRequest,
];

const updateQnaQuestion = [
  param("id").notEmpty().withMessage("id is required").isMongoId().withMessage("Invalid ID format"),
  body("status").optional().isIn(["open", "answered", "closed"]).withMessage("Invalid status"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
  validateRequest,
];

const listQnaQuestions = [
  query("course").optional().isMongoId().withMessage("Invalid course id"),
  query("chapter").optional().isMongoId().withMessage("Invalid chapter id"),
  validateRequest,
];

const addReply = [
  param("id").notEmpty().withMessage("Question id is required").isMongoId().withMessage("Invalid question id"),
  body("body").trim().notEmpty().withMessage("Reply body is required").isLength({ max: 5000 }).withMessage("Reply too long"),
  validateRequest,
];

const deleteQuestion = [
  param("id").notEmpty().withMessage("Question id is required").isMongoId().withMessage("Invalid question id"),
  validateRequest,
];

const deleteReply = [
  param("id").notEmpty().withMessage("Question id is required").isMongoId().withMessage("Invalid question id"),
  param("replyId").notEmpty().withMessage("Reply id is required").isMongoId().withMessage("Invalid reply id"),
  validateRequest,
];

module.exports = { createQnaQuestion, updateQnaQuestion, listQnaQuestions, addReply, deleteQuestion, deleteReply };

