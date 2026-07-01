const { createOrder, getPaymentMode } = require('../controllers/payment-controller/cashfree.controller');

jest.mock('../helpers/cashfree', () => ({
  createOrder: jest.fn(),
}));

jest.mock('../models/Course', () => ({
  findById: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findById: jest.fn(),
}));

jest.mock('../services/razorpayFulfillment.service', () => ({
  fulfillCoursePurchase: jest.fn(),
}));

const cashfreeHelper = require('../helpers/cashfree');
const Course = require('../models/Course');
const User = require('../models/User');

describe('Cashfree create-order controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CASHFREE_RETURN_URL;
    delete process.env.CLIENT_URL;
    delete process.env.FRONTEND_URL;
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });
  });

  it('returns a Cashfree payment session when the course is valid', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
    });

    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'cf-order-1',
      payment_session_id: 'session-123',
      payment_link: 'https://pay.cashfree.com/checkout/session-123',
      order_status: 'PENDING',
      order_amount: 499,
      order_currency: 'INR',
      cf_order_id: 'cf-order-1',
    });

    const req = {
      user: { _id: { toString: () => 'user-1' } },
      body: { courseId: 'course-1' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createOrder(req, res);

    expect(cashfreeHelper.createOrder).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        orderId: 'cf-order-1',
        paymentSessionId: 'session-123',
      }),
    );
  });

  it('uses the user phone number when creating the Cashfree order', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
    });

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
      }),
    );
  });

  it('loads the phone number from the user profile when the auth payload does not include it', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
    });
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

  it('uses a fallback phone number when the user profile has no phone', async () => {
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
    });
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

    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerDetails: expect.objectContaining({
          customer_phone: '+919999999999',
        }),
      }),
    );
  });

  it('reports production mode when CASHFREE_ENV is set to PRODUCTION', () => {
    process.env.CASHFREE_ENV = 'PRODUCTION';
    process.env.CASHFREE_APP_ID = '1322230d8063a5f44ed9e2114a90322231';
    process.env.CASHFREE_SECRET_KEY = 'cfsk_ma_prod_example';

    const res = {
      json: jest.fn(),
    };

    getPaymentMode({}, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, testMode: false });
  });

  it('builds a frontend return URL that preserves the checkout route', async () => {
    const originalNow = Date.now;
    Date.now = jest.fn(() => 1234567890);
    process.env.CLIENT_URL = 'http://localhost:5173';
    Course.findById.mockResolvedValue({
      _id: 'course-1',
      title: 'React Basics',
      price: 499,
      status: 'published',
      thumbnail: '',
      isDeleted: false,
    });
    cashfreeHelper.createOrder.mockResolvedValue({
      order_id: 'cf-order-5',
      payment_session_id: 'session-111',
      payment_link: 'https://pay.cashfree.com/checkout/session-111',
      cf_order_id: 'cf-order-5',
    });

    const req = {
      user: {
        _id: { toString: () => 'user-5' },
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

    expect(cashfreeHelper.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: 'http://localhost:5173/checkout/course-1?payment=success&orderId=kattraan-course-1-user-5-1234567890',
      }),
    );
  });
});
