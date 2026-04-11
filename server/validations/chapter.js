const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { validateMongoId } = require('./common');

const createChapter = [
  body('section').notEmpty().withMessage('Section ID is required').isMongoId().withMessage('Invalid section ID'),
  body('title').trim().notEmpty().withMessage('Chapter title is required').isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  validateRequest,
];

const updateChapter = [
  ...validateMongoId('id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('section').optional().isMongoId().withMessage('Invalid section ID'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  validateRequest,
];

module.exports = { createChapter, updateChapter };
