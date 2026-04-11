const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../../controllers/payment-controller/razorpay.controller');
const authenticate = require('../../middleware/auth-middleware');

/**
 * POST /api/payment/razorpay/create-order
 * Creates a Razorpay order for a course purchase.
 */
router.post('/create-order', authenticate, createOrder);

/**
 * POST /api/payment/razorpay/verify
 * Verifies Razorpay payment and enrolls the user.
 */
router.post('/verify', authenticate, verifyPayment);

module.exports = router;
