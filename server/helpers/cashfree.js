const { Cashfree, CFEnvironment } = require('cashfree-pg');

function getCredentials() {
  const clientId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '').trim();
  return { clientId, clientSecret };
}

/**
 * Local-only mock: skip live Cashfree when CASHFREE_MOCK=true (never in production).
 * Use this until real sandbox App ID / Secret Key are set in .env.
 */
function isMockMode() {
  if (process.env.NODE_ENV === 'production') return false;
  const flag = String(process.env.CASHFREE_MOCK || '').trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

function assertCredentialsConfigured() {
  if (isMockMode()) {
    return { clientId: 'mock', clientSecret: 'mock' };
  }
  const { clientId, clientSecret } = getCredentials();
  if (!clientId || !clientSecret) {
    const err = new Error(
      'Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in server/.env, or set CASHFREE_MOCK=true for local testing without Cashfree.',
    );
    err.statusCode = 503;
    err.code = 'cashfree_not_configured';
    throw err;
  }
  return { clientId, clientSecret };
}

function getClient() {
  const { clientId, clientSecret } = assertCredentialsConfigured();
  const env = (process.env.CASHFREE_ENV || '').toLowerCase();
  const looksProduction =
    env === 'production' ||
    clientId.toLowerCase().includes('prod') ||
    clientSecret.toLowerCase().includes('prod');
  const environment = looksProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  return new Cashfree(environment, clientId, clientSecret, undefined, undefined, undefined, false);
}

async function createOrder(params) {
  const { orderId, amount, currency = 'INR', customerDetails, notes, returnUrl, notifyUrl } = params;

  const orderNoteParts = [notes?.orderNote || 'Kattraan course purchase'];
  if (notes?.courseId) orderNoteParts.push(`courseId:${notes.courseId}`);
  if (notes?.userId) orderNoteParts.push(`userId:${notes.userId}`);

  const payload = {
    order_id: orderId,
    order_amount: Number(amount),
    order_currency: currency,
    customer_details: customerDetails,
    order_note: orderNoteParts.join(' | '),
    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl,
    },
  };

  const client = getClient();
  const response = await client.PGCreateOrder(payload);
  return response.data;
}

async function getOrder(orderId) {
  const client = getClient();
  const response = await client.PGFetchOrder(orderId);
  return response.data;
}

module.exports = {
  createOrder,
  getOrder,
  getCredentials,
  assertCredentialsConfigured,
  isMockMode,
};
