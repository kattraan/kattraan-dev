const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const createQuiz = [
  body('chapter').notEmpty().withMessage('Chapter ID is required').isMongoId().withMessage('Invalid chapter ID'),
  body('title').trim().notEmpty().withMessage('Quiz title is required').isLength({ max: 300 }).withMessage('Title too long'),
  body('description').optional().trim().isLength({ max: 10000 }).withMessage('Description too long'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text is required').isLength({ max: 1000 }).withMessage('Question too long'),
  body('questions.*.type').optional().isIn(['single', 'multiple', 'subjective']).withMessage('Invalid question type'),
  body('questions.*.options').optional().isArray().withMessage('Options must be an array'),
  body('questions.*.correctAnswer').optional().isInt({ min: 0 }).withMessage('Correct answer index must be non-negative'),
  body('questions.*.marks').optional().isInt({ min: 0 }).withMessage('Marks must be non-negative'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  validateRequest,
];

const updateQuiz = [
  param('id').notEmpty().withMessage('id is required').isMongoId().withMessage('Invalid ID format'),
  body('chapter').optional().isMongoId().withMessage('Invalid chapter ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 300 }).withMessage('Title too long'),
  body('description').optional().trim().isLength({ max: 10000 }).withMessage('Description too long'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('questions.*.question').optional().trim().notEmpty().withMessage('Question text is required').isLength({ max: 1000 }).withMessage('Question too long'),
  body('questions.*.type').optional().isIn(['single', 'multiple', 'subjective']).withMessage('Invalid question type'),
  body('questions.*.options').optional().isArray().withMessage('Options must be an array'),
  body('questions.*.correctAnswer').optional().isInt({ min: 0 }).withMessage('Correct answer index must be non-negative'),
  body('questions.*.marks').optional().isInt({ min: 0 }).withMessage('Marks must be non-negative'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  validateRequest,
];

module.exports = { createQuiz, updateQuiz };
