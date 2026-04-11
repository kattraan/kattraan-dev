const express = require('express');
const router = express.Router();
const { getRates, SUPPORTED_CURRENCIES } = require('../../services/exchangeRate.service');

/**
 * GET /api/exchange-rates
 * Returns INR-based exchange rates for all supported currencies.
 * Cached server-side for 1 hour.
 */
router.get('/', async (req, res) => {
  try {
    const rates = await getRates();
    res.json({
      success: true,
      base: 'INR',
      rates,
      supportedCurrencies: SUPPORTED_CURRENCIES,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch exchange rates' });
  }
});

module.exports = router;
