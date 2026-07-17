const {
  parseMerchantOrderId,
  parseCashfreeOrderMetadata,
} = require('../services/cashfreeOrderContext.service');

describe('cashfreeOrderContext helpers', () => {
  it('parses merchant order ids', () => {
    expect(parseMerchantOrderId('kattraan-course1-user1-123')).toEqual({
      courseId: 'course1',
      userId: 'user1',
    });
    expect(parseMerchantOrderId('bad-id')).toBeNull();
  });

  it('parses courseId/userId from order_note', () => {
    expect(
      parseCashfreeOrderMetadata({
        order_note: 'React Basics purchase | courseId:abc userId:def',
      }),
    ).toEqual({ courseId: 'abc', userId: 'def' });
  });

  it('falls back to customer_id for userId', () => {
    expect(
      parseCashfreeOrderMetadata({
        order_note: 'purchase | courseId:abc',
        customer_details: { customer_id: 'user-9' },
      }),
    ).toEqual({ courseId: 'abc', userId: 'user-9' });
  });
});
