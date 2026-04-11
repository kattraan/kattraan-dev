/**
 * Jest configuration for server (API) tests.
 * Tests run with NODE_ENV=test via npm run test.
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
  // runInBand is set in npm test script to avoid DB state conflicts
  // Ensure NODE_ENV is test (also set by cross-env in npm script)
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
