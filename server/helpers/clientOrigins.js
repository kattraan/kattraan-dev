/**
 * Shared CLIENT_URL / Origin allowlist for CORS + CSRF.
 * In non-production, any localhost / 127.0.0.1 origin is allowed dynamically
 * so Vite (any port) and 127.0.0.1 vs localhost never block auth.
 */

const isProduction = process.env.NODE_ENV === "production";

function normalizeOrigin(value) {
  if (!value || typeof value !== "string") return null;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function isLocalDevOrigin(origin) {
  if (!origin || isProduction) return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function buildConfiguredOrigins() {
  const raw =
    process.env.CLIENT_URL || (isProduction ? "" : "http://localhost:5173");
  return raw
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
}

function getAllowedOriginSet() {
  return new Set(buildConfiguredOrigins());
}

const configuredOrigins = buildConfiguredOrigins();
const allowedOriginSet = new Set(configuredOrigins);

function isOriginAllowed(origin) {
  if (!origin) return true; // non-browser / same-origin style clients
  if (getAllowedOriginSet().has(origin)) return true;
  if (isLocalDevOrigin(origin)) return true;
  return false;
}

module.exports = {
  isProduction,
  normalizeOrigin,
  isLocalDevOrigin,
  isOriginAllowed,
  buildConfiguredOrigins,
  getAllowedOriginSet,
  configuredOrigins,
  allowedOriginSet,
};
