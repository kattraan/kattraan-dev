const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { validateMongoId } = require('./common');

const createSection = [
  body('course').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid course ID'),
  body('title').trim().notEmpty().withMessage('Section title is required').isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('dripDays').optional().isInt({ min: 0 }).withMessage('Drip days must be a non-negative integer'),
  body('unlockDate').optional().isISO8601().withMessage('Unlock date must be a valid date'),
  body('completionPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Completion must be 0-100'),
  validateRequest,
];

const updateSection = [
  ...validateMongoId('id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title must be at most 200 characters'),
  body('course').optional().isMongoId().withMessage('Invalid course ID'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('dripDays').optional().isInt({ min: 0 }).withMessage('Drip days must be a non-negative integer'),
  body('unlockDate').optional().isISO8601().withMessage('Unlock date must be a valid date'),
  body('completionPercentage').optional().isInt({ min: 0, max: 100 }).withMessage('Completion must be 0-100'),
  validateRequest,
];

module.exports = { createSection, updateSection };
