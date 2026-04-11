const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const createLearnerCourseReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Comment too long'),
  body('tags').optional().isArray({ max: 8 }).withMessage('Tags must be an array (max 8)'),
  body('tags.*').optional().isString().trim().isLength({ min: 2, max: 40 }).withMessage('Each tag must be 2-40 chars'),
  validateRequest,
];

const updateLearnerCourseReview = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Comment too long'),
  body('tags').optional().isArray({ max: 8 }).withMessage('Tags must be an array (max 8)'),
  body('tags.*').optional().isString().trim().isLength({ min: 2, max: 40 }).withMessage('Each tag must be 2-40 chars'),
  validateRequest,
];

const updateInstructorReviewMeta = [
  body('reply').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }).withMessage('Reply too long'),
  body('pinned').optional().isBoolean().withMessage('Pinned must be true/false'),
  validateRequest,
];

module.exports = { createLearnerCourseReview, updateLearnerCourseReview, updateInstructorReviewMeta };
