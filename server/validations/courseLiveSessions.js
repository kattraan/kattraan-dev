const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

/** Detailed validation happens in controller (URL + date per row). */
const updateCourseLiveSessions = [
  param("id").notEmpty().isMongoId().withMessage("Invalid course ID"),
  body("sessions").isArray().withMessage("sessions must be an array"),
  validateRequest,
];

module.exports = { updateCourseLiveSessions };
