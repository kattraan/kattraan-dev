/**
 * CSRF protection via exact Origin header allowlist.
 *
 * For state-changing requests (POST / PATCH / PUT / DELETE) this middleware
 * verifies that the `Origin` header matches a configured client origin
 * (or any localhost / 127.0.0.1 origin in development).
 *
 * Safe methods (GET / HEAD / OPTIONS) pass through.
 * In development, requests with no Origin (Postman / curl) are allowed.
 */

const {
  isProduction,
  normalizeOrigin,
  isOriginAllowed,
} = require("../helpers/clientOrigins");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  // External webhooks (Bunny, Cashfree) have no browser Origin
  if (req.path && req.path.startsWith("/api/webhooks")) return next();

  const originHeader = req.headers.origin;
  const origin = normalizeOrigin(originHeader);

  if (!isProduction && !originHeader) return next();

  if (!origin || !isOriginAllowed(origin)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: cross-site request rejected",
    });
  }

  next();
}

module.exports = csrfProtection;
