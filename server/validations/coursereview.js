const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { validateMongoId } = require('./common');

const createCourseReview = [
  body('course').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid course ID'),
  body('user').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Comment too long'),
  validateRequest,
];

const updateCourseReview = [
  ...validateMongoId('id'),
  body('course').optional().isMongoId().withMessage('Invalid course ID'),
  body('user').optional().isMongoId().withMessage('Invalid user ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Comment too long'),
  validateRequest,
];

module.exports = { createCourseReview, updateCourseReview };
