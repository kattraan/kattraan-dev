const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const createComment = [
  body('content').notEmpty().withMessage('Content ID is required').isMongoId().withMessage('Invalid content ID'),
  body('user').optional().isMongoId().withMessage('Invalid user ID'),
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 5000 }).withMessage('Comment too long'),
  body('replies').optional().isArray().withMessage('Replies must be an array'),
  validateRequest,
];

const updateComment = [
  param('id').notEmpty().withMessage('id is required').isMongoId().withMessage('Invalid ID format'),
  body('content').optional().isMongoId().withMessage('Invalid content ID'),
  body('user').optional().isMongoId().withMessage('Invalid user ID'),
  body('text').optional().trim().notEmpty().withMessage('Comment text cannot be empty').isLength({ max: 5000 }).withMessage('Comment too long'),
  body('replies').optional().isArray().withMessage('Replies must be an array'),
  validateRequest,
];

module.exports = { createComment, updateComment };
