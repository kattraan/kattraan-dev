const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const validateLogin = [
  body('userEmail').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

const validateForgotPassword = [
  body('userEmail').notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email required'),
  validateRequest,
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required').trim().isLength({ max: 500 }).withMessage('Invalid token'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
  validateRequest,
];

const validateSubmitEnrollment = [
  body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio too long'),
  body('experience').optional().trim().isLength({ max: 2000 }).withMessage('Experience too long'),
  body('expertise').optional().trim().isLength({ max: 500 }).withMessage('Expertise too long'),
  body('linkedin').optional().trim().isURL().withMessage('Invalid LinkedIn URL'),
  body('website').optional().trim().isURL().withMessage('Invalid website URL'),
  validateRequest,
];

const validateAdminApprove = [
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
  body('action').notEmpty().withMessage('Action is required').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  validateRequest,
];

const validateGoogleOneTap = [
  body('id_token').notEmpty().withMessage('ID token is required').trim().isLength({ min: 10, max: 5000 }).withMessage('Invalid ID token'),
  validateRequest,
];

module.exports = {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateSubmitEnrollment,
  validateAdminApprove,
  validateGoogleOneTap,
};
