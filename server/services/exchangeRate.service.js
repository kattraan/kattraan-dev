/**
 * Exchange Rate Service
 *
 * Uses open.er-api.com — the same provider as exchangerate-api.com but with a
 * COMPLETELY FREE endpoint that requires NO API key.
 * URL: https://open.er-api.com/v6/latest/INR
 * Limit: 1500 free requests/month (with 1-hr server cache → ≤720 req/month)
 *
 * If EXCHANGE_RATE_API_KEY is set in .env the paid/authenticated endpoint is
 * used instead (higher quota). Otherwise the open endpoint is used automatically.
 *
 * If both fail, safe hardcoded fallback rates are returned so pricing never breaks.
 */

const https = require('https');

// Supported display currencies (subset — add more as needed)
const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY', 'MYR', 'NZD', 'CHF', 'HKD'];

// Approximate fallback rates (INR base, updated periodically in code)
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
  JPY: 1.78,
  MYR: 0.056,
  NZD: 0.020,
  CHF: 0.011,
  HKD: 0.094,
};

let cache = {
  rates: null,
  fetchedAt: null,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isCacheValid() {
  return cache.rates !== null && cache.fetchedAt !== null && (Date.now() - cache.fetchedAt < CACHE_TTL_MS);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Both open.er-api.com and v6.exchangerate-api.com use "result":"success"
          if (parsed.result === 'success') {
            resolve(parsed.conversion_rates);
          } else {
            reject(new Error(`API error: ${parsed['error-type'] || JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchFromApi() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // Prefer the authenticated endpoint when a key is provided (higher quota)
  if (apiKey) {
    return fetchUrl(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`);
  }

  // No key? Use the free open endpoint — no signup required
  return fetchUrl('https://open.er-api.com/v6/latest/INR');
}

/**
 * Returns exchange rates with INR as base currency.
 * Only returns the SUPPORTED_CURRENCIES subset for a clean API response.
 */
async function getRates() {
  if (isCacheValid()) {
    return filterRates(cache.rates);
  }

  try {
    const allRates = await fetchFromApi();
    cache = { rates: allRates, fetchedAt: Date.now() };
    const endpoint = process.env.EXCHANGE_RATE_API_KEY ? 'authenticated API' : 'open.er-api.com (no key)';
    console.log(`[ExchangeRate] Fetched fresh rates from ${endpoint}`);
    return filterRates(allRates);
  } catch (err) {
    console.warn(`[ExchangeRate] Fetch failed (${err.message}), using hardcoded fallback rates`);
    return FALLBACK_RATES;
  }
}

function filterRates(allRates) {
  const result = {};
  SUPPORTED_CURRENCIES.forEach((code) => {
    if (allRates[code] !== undefined) result[code] = allRates[code];
  });
  return result;
}

module.exports = { getRates, SUPPORTED_CURRENCIES, FALLBACK_RATES };
