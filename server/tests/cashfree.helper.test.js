jest.mock('cashfree-pg', () => ({
  Cashfree: jest.fn().mockImplementation(() => ({
    PGCreateOrder: jest.fn().mockResolvedValue({ order_id: 'cf-1' }),
    PGFetchOrder: jest.fn().mockResolvedValue({ order_id: 'cf-1' }),
  })),
  CFEnvironment: {
    SANDBOX: 'sandbox',
    PRODUCTION: 'production',
  },
}));

const { Cashfree } = require('cashfree-pg');
const cashfree = require('../helpers/cashfree');

describe('Cashfree helper initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CASHFREE_ENV;
    process.env.CASHFREE_APP_ID = 'app_prod_123';
    process.env.CASHFREE_SECRET_KEY = 'secret';
  });

  it('initializes the production client when the credentials look production-based', async () => {
    await cashfree.createOrder({
      orderId: 'order-1',
      amount: 100,
      currency: 'INR',
      customerDetails: {},
      notes: {},
      returnUrl: 'https://example.com/success',
      notifyUrl: 'https://example.com/webhook',
    });

    expect(Cashfree).toHaveBeenCalledWith('production', 'app_prod_123', 'secret', undefined, undefined, undefined, false);
  });
});
