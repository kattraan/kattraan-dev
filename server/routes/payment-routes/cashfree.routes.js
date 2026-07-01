const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentMode } = require('../../controllers/payment-controller/cashfree.controller');
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
        res.status(429).json({ success: false, message: 'Too many order attempts. Please try again in a few minutes.' });
      },
    });

router.get('/mode', getPaymentMode);
router.post('/create-order', createOrderLimiter, authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

module.exports = router;
