/**
 * Currency utilities
 * All course prices are stored in INR. These helpers convert and format them
 * for display in the user's preferred currency.
 */

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
  MYR: 'RM ',
  NZD: 'NZ$',
  CHF: 'CHF ',
  HKD: 'HK$',
};

export const CURRENCY_NAMES = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  SGD: 'Singapore Dollar',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  JPY: 'Japanese Yen',
  MYR: 'Malaysian Ringgit',
  NZD: 'New Zealand Dollar',
  CHF: 'Swiss Franc',
  HKD: 'Hong Kong Dollar',
};

// Currencies that display without decimal places
const NO_DECIMAL_CURRENCIES = new Set(['JPY', 'INR']);

/**
 * Convert an amount from INR to the target currency.
 * @param {number} amountINR  - Price in INR
 * @param {string} targetCurrency - ISO 4217 currency code
 * @param {Object} rates - Exchange rates map (INR base)
 * @returns {number}
 */
export function convertFromINR(amountINR, targetCurrency, rates) {
  if (!amountINR || amountINR === 0) return 0;
  if (targetCurrency === 'INR') return amountINR;
  const rate = rates?.[targetCurrency];
  if (!rate) return amountINR; // fallback to raw number
  return amountINR * rate;
}

/**
 * Format a price (in INR) into a display string for the target currency.
 * e.g. formatPrice(999, 'USD', rates) → "$11.99"
 *      formatPrice(999, 'INR', rates) → "₹999"
 *      formatPrice(0, ...) → "Free"
 * @param {number} amountINR
 * @param {string} targetCurrency
 * @param {Object} rates
 * @returns {string}
 */
export function formatPrice(amountINR, targetCurrency = 'INR', rates = {}) {
  if (!amountINR || amountINR === 0) return 'Free';
  const converted = convertFromINR(amountINR, targetCurrency, rates);
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency + ' ';
  const decimals = NO_DECIMAL_CURRENCIES.has(targetCurrency) ? 0 : 2;
  // Use locale-aware number formatting for thousands separators
  const formatted = converted.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * Detect the user's preferred currency from the browser locale/timezone.
 *
 * IMPORTANT: navigator.language reflects the *browser UI language*, NOT the
 * user's geographic location. An Indian user with an English browser will get
 * 'en-US' or 'en-GB', which would wrongly map to USD or GBP.
 *
 * Strategy (most-to-least reliable):
 *  1. Timezone-based mapping (timezone IS location-based, unlike language)
 *  2. Strict locale match only for very specific regional locales (e.g. hi-IN)
 *  3. Default to INR (the platform's base currency)
 *
 * The user can always override via the currency selector in the navbar.
 */
export function detectUserCurrency(supportedCurrencies = []) {
  try {
    // --- 1. Timezone → currency (most reliable geo signal) ---
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const timezoneCurrencyMap = {
      // India
      'Asia/Calcutta': 'INR', 'Asia/Kolkata': 'INR',
      // USA
      'America/New_York': 'USD', 'America/Chicago': 'USD',
      'America/Denver': 'USD', 'America/Los_Angeles': 'USD',
      'America/Phoenix': 'USD', 'America/Anchorage': 'USD',
      'Pacific/Honolulu': 'USD',
      // UK
      'Europe/London': 'GBP',
      // Eurozone
      'Europe/Berlin': 'EUR', 'Europe/Paris': 'EUR', 'Europe/Rome': 'EUR',
      'Europe/Madrid': 'EUR', 'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR',
      'Europe/Vienna': 'EUR', 'Europe/Athens': 'EUR', 'Europe/Lisbon': 'EUR',
      // UAE
      'Asia/Dubai': 'AED',
      // Singapore
      'Asia/Singapore': 'SGD',
      // Australia
      'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD',
      'Australia/Brisbane': 'AUD', 'Australia/Perth': 'AUD',
      // Canada
      'America/Toronto': 'CAD', 'America/Vancouver': 'CAD',
      'America/Edmonton': 'CAD', 'America/Halifax': 'CAD',
      // Japan
      'Asia/Tokyo': 'JPY',
      // Malaysia
      'Asia/Kuala_Lumpur': 'MYR',
      // New Zealand
      'Pacific/Auckland': 'NZD',
      // Switzerland
      'Europe/Zurich': 'CHF',
      // Hong Kong
      'Asia/Hong_Kong': 'HKD',
    };

    const fromTimezone = timezoneCurrencyMap[timezone];
    if (fromTimezone && (supportedCurrencies.length === 0 || supportedCurrencies.includes(fromTimezone))) {
      return fromTimezone;
    }

    // --- 2. Only trust locale if it has a clear country component (e.g. hi-IN, ta-IN) ---
    const locale = navigator.language || '';
    const strictLocaleMap = {
      'hi-IN': 'INR', 'ta-IN': 'INR', 'te-IN': 'INR', 'kn-IN': 'INR',
      'ml-IN': 'INR', 'mr-IN': 'INR', 'bn-IN': 'INR', 'gu-IN': 'INR',
      'en-IN': 'INR',
      'ja-JP': 'JPY', 'ko-KR': 'USD', // KRW not in our set
      'zh-CN': 'USD', 'zh-TW': 'USD',
      'ar-AE': 'AED', 'ar-SA': 'USD',
      'ms-MY': 'MYR',
      'en-SG': 'SGD',
      'en-AU': 'AUD',
      'en-NZ': 'NZD',
      'en-HK': 'HKD',
      'de-CH': 'CHF', 'fr-CH': 'CHF', 'it-CH': 'CHF',
    };
    const fromLocale = strictLocaleMap[locale];
    if (fromLocale && (supportedCurrencies.length === 0 || supportedCurrencies.includes(fromLocale))) {
      return fromLocale;
    }
  } catch (_) { /* ignore */ }

  // --- 3. Default to INR (platform base currency) ---
  return 'INR';
}
