/**
 * Auth cookie SameSite policy for JWT access/refresh cookies.
 *
 * When the SPA (CLIENT_URL) and API are on different hosts (e.g. Vercel + Render),
 * browsers do not send SameSite=Strict cookies on cross-site XHR/fetch — even with
 * credentials — so /refresh returns 401 "No refresh token".
 *
 * Optional override: AUTH_COOKIE_SAME_SITE=strict|lax|none
 */
function getAuthCookieSameSite() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return "lax";

  const explicit = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  if (explicit === "strict" || explicit === "lax" || explicit === "none") {
    return explicit;
  }

  const clientRaw = (process.env.CLIENT_URL || "").trim().replace(/\/+$/, "");
  const apiRaw = (
    process.env.RENDER_EXTERNAL_URL ||
    process.env.API_PUBLIC_URL ||
    process.env.PUBLIC_API_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (!clientRaw || !apiRaw) {
    return "none";
  }
  try {
    const clientHost = new URL(clientRaw).hostname;
    const apiHost = new URL(apiRaw).hostname;
    if (clientHost !== apiHost) return "none";
    return "strict";
  } catch {
    return "none";
  }
}

function getAuthCookieSecure() {
  return process.env.NODE_ENV === "production";
}

module.exports = { getAuthCookieSameSite, getAuthCookieSecure };
