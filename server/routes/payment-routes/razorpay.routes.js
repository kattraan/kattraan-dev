const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createOrder, verifyPayment } = require('../../controllers/payment-controller/razorpay.controller');
const authenticate = require('../../middleware/auth-middleware');

const isDev = process.env.NODE_ENV !== 'production';

const createOrderLimiter = isDev
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many order attempts. Please try again in a few minutes.',
        });
      },
    });

const verifyLimiter = isDev
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many verification attempts. Please try again shortly.',
        });
      },
    });

/**
 * POST /api/payment/razorpay/create-order
 * Creates a Razorpay order for a course purchase.
 */
router.post('/create-order', createOrderLimiter, authenticate, createOrder);

/**
 * POST /api/payment/razorpay/verify
 * Verifies Razorpay payment and enrolls the user.
 */
router.post('/verify', verifyLimiter, authenticate, verifyPayment);

module.exports = router;
