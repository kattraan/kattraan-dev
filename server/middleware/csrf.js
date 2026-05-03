/**
 * CSRF protection via Origin header validation.
 *
 * For state-changing requests (POST / PATCH / PUT / DELETE) this middleware
 * verifies that the `Origin` header matches the configured client URL.
 * Browsers always include the Origin header for cross-origin requests; it
 * cannot be forged by JavaScript, making this an effective CSRF defence when
 * combined with the existing CORS policy and cookie-based authentication.
 *
 * Safe methods (GET / HEAD / OPTIONS) pass through unconditionally.
 * In development, requests with no Origin header (e.g. Postman / curl)
 * also pass through to allow easy local testing.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').trim();
const isProduction = process.env.NODE_ENV === 'production';

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  // Webhooks are called by external services (e.g. Bunny, Razorpay); skip Origin check
  if (req.path && req.path.startsWith('/api/webhooks')) return next();
  if (req.path === '/api/payments/webhook') return next();

  const origin = req.headers.origin;

  // Allow tool-based requests (no Origin header) only during development
  if (!isProduction && !origin) return next();

  if (!origin || !origin.startsWith(clientOrigin)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: cross-site request rejected',
    });
  }

  next();
}

module.exports = csrfProtection;
