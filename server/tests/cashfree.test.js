const { createOrder, getPaymentMode } = require('../controllers/payment-controller/cashfree.controller');

jest.mock('../helpers/cashfree', () => ({
  createOrder: jest.fn(),
  isMockMode: jest.fn(() => false),
}));

jest.mock('../models/Course', () => ({
  findById: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findById: jest.fn(),
}));

jest.mock('../models/PendingPayment', () => ({
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/paymentFulfillment.service', () => ({
  fulfillCoursePurchase: jest.fn(),
}));

const cashfreeHelper = require('../helpers/cashfree');
const Course = require('../models/Course');
const User = require('../models/User');
const PendingPayment = require('../models/PendingPayment');

function mockPublishedCourse(overrides = {}) {
  Course.findById.mockReturnValue({
    lean: jest.fn().mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
      ...overrides,
    }),
  });
}

describe('Cashfree create-order controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CASHFREE_RETURN_URL;
    delete process.env.CASHFREE_MOCK;
    delete process.env.CLIENT_URL;
    delete process.env.FRONTEND_URL;
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });
  });

  it('returns a Cashfree payment session and persists pending payment metadata', async () => {
    const originalNow = Date.now;
    Date.now = jest.fn(() => 111);
    mockPublishedCourse();

    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'kattraan-course-1-user-1-111',
      payment_session_id: 'session-123',
      payment_link: 'https://pay.cashfree.com/checkout/session-123',
      order_status: 'PENDING',
      order_amount: 499,
      order_currency: 'INR',
      cf_order_id: 'cf-order-1',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-1' },
        phoneNumber: '9876543210',
        userEmail: 'test@example.com',
        userName: 'Test User',
      },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await createOrder(req, res);
    } finally {
      Date.now = originalNow;
    }

    const generatedOrderId = PendingPayment.findOneAndUpdate.mock.calls[0][0].orderId;
    expect(generatedOrderId).toMatch(/^kattraan-[a-z0-9]+-[a-f0-9]{16}$/);
    expect(generatedOrderId.length).toBeLessThanOrEqual(45);
    expect(PendingPayment.findOneAndUpdate).toHaveBeenCalledWith(
      { orderId: generatedOrderId },
      expect.objectContaining({
        userId: 'user-1',
        courseId: 'course-1',
        amountINR: 499,
        status: 'pending',
      }),
      expect.any(Object),
    );
    expect(cashfreeHelper.createOrder).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        orderId: generatedOrderId,
        paymentSessionId: 'session-123',
        cfOrderId: 'cf-order-1',
      }),
    );
  });

  it('uses the user phone number when creating the Cashfree order', async () => {
    mockPublishedCourse();

    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'cf-order-2',
      payment_session_id: 'session-456',
      payment_link: 'https://pay.cashfree.com/checkout/session-456',
      cf_order_id: 'cf-order-2',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-2' },
        phoneNumber: '9876543210',
        userEmail: 'test@example.com',
        userName: 'Test User',
      },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createOrder(req, res);

    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerDetails: expect.objectContaining({
          customer_phone: '+919876543210',
        }),
        notes: expect.objectContaining({
          courseId: 'course-1',
          userId: 'user-2',
        }),
      }),
    );
  });

  it('loads the phone number from the user profile when the auth payload does not include it', async () => {
    mockPublishedCourse();
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        phoneNumber: '9876543210',
        userEmail: 'profile@example.com',
        userName: 'Profile User',
      }),
    });
    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'cf-order-3',
      payment_session_id: 'session-789',
      payment_link: 'https://pay.cashfree.com/checkout/session-789',
      cf_order_id: 'cf-order-3',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-3' },
      },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createOrder(req, res);

    expect(User.findById).toHaveBeenCalledWith('user-3');
    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerDetails: expect.objectContaining({
          customer_phone: '+919876543210',
        }),
      }),
    );
  });

  it('rejects checkout when the user profile has no valid phone', async () => {
    mockPublishedCourse();
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        phoneNumber: '',
        userEmail: 'profile@example.com',
        userName: 'Profile User',
      }),
    });
    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'cf-order-4',
      payment_session_id: 'session-000',
      payment_link: 'https://pay.cashfree.com/checkout/session-000',
      cf_order_id: 'cf-order-4',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-4' },
      },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/valid Indian phone number/i),
      }),
    );
    expect(PendingPayment.findOneAndUpdate).not.toHaveBeenCalled();
    expect(cashfreeHelper.createOrder).not.toHaveBeenCalled();
  });

  it('reports production mode when CASHFREE_ENV is set to PRODUCTION', () => {
    process.env.CASHFREE_ENV = 'PRODUCTION';
    process.env.CASHFREE_APP_ID = '1322230d8063a5f44ed9e2114a90322231';
    process.env.CASHFREE_SECRET_KEY = 'cfsk_ma_prod_example';

    const res = {
      json: jest.fn(),
    };

    getPaymentMode({}, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      testMode: false,
      mock: false,
      productionMode: true,
      blockLocalhostProduction: true,
    });
  });

  it('uses the request origin for return URL when provided', async () => {
    const originalNow = Date.now;
    Date.now = jest.fn(() => 1234567890);
    process.env.CLIENT_URL = 'https://www.kattraan.com,https://kattraan.com/';
    mockPublishedCourse();
    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'kattraan-course-1-user-6-1234567890',
      payment_session_id: 'session-222',
      payment_link: 'https://pay.cashfree.com/checkout/session-222',
      cf_order_id: 'cf-order-6',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-6' },
        phoneNumber: '9876543210',
        userEmail: 'test@example.com',
        userName: 'Test User',
      },
      body: { courseId: 'course-1', returnOrigin: 'https://kattraan.com' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await createOrder(req, res);
    } finally {
      Date.now = originalNow;
    }

    const generatedOrderId = PendingPayment.findOneAndUpdate.mock.calls[0][0].orderId;
    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: `https://kattraan.com/checkout/course-1?payment=success&orderId=${generatedOrderId}`,
      }),
    );
  });

  it('blocks production Cashfree checkout from localhost', async () => {
    process.env.CASHFREE_ENV = 'PRODUCTION';
    process.env.CASHFREE_APP_ID = '1322230d8063a5f44ed9e2114a90322231';
    process.env.CASHFREE_SECRET_KEY = 'cfsk_ma_prod_example';
    mockPublishedCourse();

    const req = {
      user: {
        _id: { toString: () => 'user-7' },
        phoneNumber: '9876543210',
        userEmail: 'test@example.com',
        userName: 'Test User',
      },
      headers: { origin: 'http://localhost:5173' },
      body: { courseId: 'course-1', returnOrigin: 'http://localhost:5173' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringMatching(/localhost/i),
      }),
    );
    expect(cashfreeHelper.createOrder).not.toHaveBeenCalled();
  });

  it('builds a return URL from the first origin in a comma-separated CLIENT_URL', async () => {
    const originalNow = Date.now;
    Date.now = jest.fn(() => 1234567890);
    process.env.CLIENT_URL = 'https://www.kattraan.com,https://kattraan.com/';
    mockPublishedCourse();
    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'kattraan-course-1-user-5-1234567890',
      payment_session_id: 'session-111',
      payment_link: 'https://pay.cashfree.com/checkout/session-111',
      cf_order_id: 'cf-order-5',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-5' },
        phoneNumber: '9876543210',
        userEmail: 'test@example.com',
        userName: 'Test User',
      },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await createOrder(req, res);
    } finally {
      Date.now = originalNow;
    }

    const generatedOrderId = PendingPayment.findOneAndUpdate.mock.calls[0][0].orderId;
    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: `https://www.kattraan.com/checkout/course-1?payment=success&orderId=${generatedOrderId}`,
      }),
    );
  });
});
