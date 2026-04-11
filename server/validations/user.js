const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { validateMongoId } = require('./common');

const updateUser = [
  ...validateMongoId('id'),
  body('userName').optional().trim().notEmpty().withMessage('Username cannot be empty').isLength({ max: 100 }).withMessage('Username too long'),
  body('userEmail').optional().isEmail().withMessage('Valid email required'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain a special character'),
  body('status')
    .optional()
    .isIn(['active', 'pending_enrollment', 'pending_approval', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('enrollmentData').optional().isObject().withMessage('Enrollment data must be an object'),
  body('enrollmentData.bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio too long'),
  body('enrollmentData.experience').optional().trim().isLength({ max: 2000 }).withMessage('Experience too long'),
  body('enrollmentData.expertise').optional().trim().isLength({ max: 500 }).withMessage('Expertise too long'),
  body('enrollmentData.linkedin').optional().trim().isLength({ max: 500 }), // Allow "linkedin.com/foo" without https
  body('enrollmentData.website').optional().trim().isLength({ max: 500 }), // Allow "example.com" without https
  body('enrollmentData.gender').optional().trim().isLength({ max: 50 }),
  body('enrollmentData.dateOfBirth').optional(),
  body('enrollmentData.category').optional().trim().isLength({ max: 100 }),
  body('enrollmentData.showSubscriberCount').optional().isBoolean(),
  body('enrollmentData.socialLinks').optional().isObject(),
  body('enrollmentData.socialDisplayOnProfile').optional().isObject(),
  body('enrollmentData.invoiceAddress').optional().isObject(),
  body('phoneNumber').optional().trim().isLength({ max: 20 }),
  validateRequest,
];

module.exports = { updateUser };
