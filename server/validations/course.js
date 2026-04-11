const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { validateMongoId } = require('./common');

const createCourse = [
  body('title').trim().notEmpty().withMessage('Course title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('subtitle').optional().trim().isLength({ max: 300 }).withMessage('Subtitle too long'),
  body('description').optional().trim(),
  body('thumbnail').optional().trim().isURL().withMessage('Thumbnail must be a valid URL'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category too long'),
  body('language').optional().trim().isLength({ max: 10 }).withMessage('Language code too long'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be 0–100'),
  body('dripType').optional().trim().isLength({ max: 100 }).withMessage('Drip type too long'),
  body('sections').optional().isArray().withMessage('Sections must be an array'),
  validateRequest,
];

// status and approval fields are never editable via general update (admin uses dedicated routes)
const updateCourse = [
  param('id').notEmpty().withMessage('id is required').isMongoId().withMessage('Invalid ID format'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title too long'),
  body('subtitle').optional().trim().isLength({ max: 300 }).withMessage('Subtitle too long'),
  body('description').optional().trim(),
  body('thumbnail').optional().trim().isURL().withMessage('Thumbnail must be a valid URL'),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category too long'),
  body('language').optional().trim().isLength({ max: 10 }).withMessage('Language code too long'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be 0–100'),
  body('dripType').optional().trim().isLength({ max: 100 }).withMessage('Drip type too long'),
  validateRequest,
];

const cloneCourse = [param('id').notEmpty().withMessage('id is required').isMongoId().withMessage('Invalid ID format'), validateRequest];

module.exports = { createCourse, updateCourse, cloneCourse };
