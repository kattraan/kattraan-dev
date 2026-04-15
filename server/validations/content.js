const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const createContent = [
  body("chapter")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID"),
  body("type")
    .notEmpty()
    .withMessage("Content type is required")
    .isIn(["video", "article", "quiz", "image", "audio", "resource"])
    .withMessage("Invalid content type"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 300 })
    .withMessage("Title too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Description too long"),
  body("thumbnail")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be non-negative"),
  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be an object"),
  validateRequest,
];

/** For article/video/audio/image/resource routes where type is implicit */
const createContentBody = [
  body("chapter")
    .notEmpty()
    .withMessage("Chapter ID is required")
    .isMongoId()
    .withMessage("Invalid chapter ID"),
  body("type")
    .optional()
    .isIn(["video", "article", "quiz", "image", "audio", "resource"])
    .withMessage("Invalid content type"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 300 })
    .withMessage("Title too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Description too long"),
  body("thumbnail")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be non-negative"),
  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be an object"),
  validateRequest,
];

const updateContent = [
  param("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Invalid ID format"),
  body("chapter").optional().isMongoId().withMessage("Invalid chapter ID"),
  body("type")
    .optional()
    .isIn(["video", "article", "quiz", "image", "audio", "resource"])
    .withMessage("Invalid content type"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 300 })
    .withMessage("Title too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Description too long"),
  body("thumbnail")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be non-negative"),
  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be an object"),
  body("resources")
    .optional()
    .isArray()
    .withMessage("Resources must be an array"),
  body("resources.*.title").optional().trim(),
  body("resources.*.url").optional().trim(),
  validateRequest,
];

module.exports = { createContent, createContentBody, updateContent };
