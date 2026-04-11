const { validationResult } = require('express-validator');

/**
 * Middleware that runs after validation chains. Reads express-validator results,
 * returns 400 with structured JSON if there are errors. Does not expose stack traces.
 */
function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  const errors = result.array().map((err) => ({
    field: err.path ?? err.param ?? 'body',
    message: err.msg,
  }));
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  });
}

module.exports = validateRequest;
