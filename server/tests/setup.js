/**
 * Jest setup: ensure test environment variables are set before requiring app.
 * Required so auth middleware and controllers have JWT secrets when tests run.
 */
process.env.NODE_ENV = "test";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret-do-not-use-in-production";
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-do-not-use-in-production";
}
