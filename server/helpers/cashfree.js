const { Cashfree, CFEnvironment } = require('cashfree-pg');

function getClient() {
  const env = (process.env.CASHFREE_ENV || '').toLowerCase();
  const clientId = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '';
  const clientSecret = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '';
  const looksProduction = env === 'production' || clientId.toLowerCase().includes('prod') || clientSecret.toLowerCase().includes('prod');
  const environment = looksProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  return new Cashfree(environment, clientId, clientSecret, undefined, undefined, undefined, false);
}

async function createOrder(params) {
  const { orderId, amount, currency = 'INR', customerDetails, notes, returnUrl, notifyUrl } = params;

  const payload = {
    order_id: orderId,
    order_amount: Number(amount),
    order_currency: currency,
    customer_details: customerDetails,
    order_note: notes?.orderNote || 'Kattraan course purchase',
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

module.exports = { createOrder, getOrder };
