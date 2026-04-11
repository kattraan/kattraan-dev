/**
 * Logger utility: dev logs to console, production no-ops.
 * Use logger.debug / logger.warn / logger.error instead of console.*
 * to avoid leaking logs in production and allow future monitoring integration.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    if (isDev) console.error(...args);
    // Production: placeholder for monitoring (e.g. Sentry, LogRocket)
    // if (!isDev) monitoring?.captureException?.(args[0]);
  },
};

export default logger;
