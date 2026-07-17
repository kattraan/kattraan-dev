/**
 * CSRF protection via exact Origin header allowlist.
 *
 * For state-changing requests (POST / PATCH / PUT / DELETE) this middleware
 * verifies that the `Origin` header exactly matches a configured client origin.
 * Browsers always include Origin for cross-origin requests; it cannot be forged
 * by page JavaScript, making this effective with cookie auth + CORS.
 *
 * Safe methods (GET / HEAD / OPTIONS) pass through.
 * In development, requests with no Origin (Postman / curl) are allowed.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const isProduction = process.env.NODE_ENV === 'production';

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function buildAllowedOrigins() {
  const raw = (process.env.CLIENT_URL || 'http://localhost:5173').trim();
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const origins = new Set();
  for (const part of parts) {
    const origin = normalizeOrigin(part);
    if (origin) origins.add(origin);
  }
  if (!origins.size) origins.add('http://localhost:5173');
  return origins;
}

const allowedOrigins = buildAllowedOrigins();

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  // External webhooks (Bunny, Cashfree) have no browser Origin
  if (req.path && req.path.startsWith('/api/webhooks')) return next();

  const originHeader = req.headers.origin;
  const origin = normalizeOrigin(originHeader);

  if (!isProduction && !originHeader) return next();

  if (!origin || !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: cross-site request rejected',
    });
  }

  next();
}

module.exports = csrfProtection;
