const { param, body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const validateDeleteKey = [
  param('key').notEmpty().withMessage('Asset key is required').trim().isLength({ max: 500 }).withMessage('Invalid key'),
  validateRequest,
];

const validateUploadBody = [
  body('courseId')
    .notEmpty()
    .withMessage('courseId is required for media upload')
    .isMongoId()
    .withMessage('Invalid course ID'),
  validateRequest,
];

module.exports = { validateDeleteKey, validateUploadBody };
