const crypto = require('crypto');
const {
  verifyCashfreeWebhookSignature,
} = require('../controllers/webhooks/cashfreeWebhook.controller');

describe('Cashfree webhook signature verification', () => {
  const secret = 'cfsk_test_secret';
  const rawBody = '{"type":"PAYMENT_SUCCESS","order":{"order_id":"ord_1"}}';
  const timestamp = String(Date.now());

  beforeEach(() => {
    process.env.CASHFREE_SECRET_KEY = secret;
  });

  afterEach(() => {
    delete process.env.CASHFREE_SECRET_KEY;
  });

  function sign(ts, body) {
    return crypto.createHmac('sha256', secret).update(ts + body).digest('base64');
  }

  it('accepts a valid signature', () => {
    expect(() =>
      verifyCashfreeWebhookSignature(rawBody, sign(timestamp, rawBody), timestamp),
    ).not.toThrow();
  });

  it('rejects an invalid signature', () => {
    expect(() =>
      verifyCashfreeWebhookSignature(rawBody, 'bad-signature-value!!!!!!!!!!!', timestamp),
    ).toThrow(/Invalid webhook signature/);
  });

  it('rejects missing signature headers', () => {
    expect(() => verifyCashfreeWebhookSignature(rawBody, '', timestamp)).toThrow(
      /Missing webhook signature/,
    );
  });

  it('rejects when secret is not configured', () => {
    delete process.env.CASHFREE_SECRET_KEY;
    delete process.env.CASHFREE_CLIENT_SECRET;
    expect(() =>
      verifyCashfreeWebhookSignature(rawBody, sign(timestamp, rawBody), timestamp),
    ).toThrow(/CASHFREE_SECRET_KEY/);
  });
});
