const crypto = require('crypto');
const PendingPayment = require('../models/PendingPayment');

const ORDER_ID_PREFIX = 'kattraan';

/**
 * Build a compact, unique merchant order id that stays under Cashfree's limit.
 * Course/user binding lives in PendingPayment, not in the public order id.
 */
function buildMerchantOrderId() {
  const time = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${ORDER_ID_PREFIX}-${time}-${random}`;
}

/**
 * Parse legacy merchant order ids created before PendingPayment was introduced.
 * @returns {{ courseId: string, userId: string }|null}
 */
function parseMerchantOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') return null;
  const parts = orderId.split('-');
  if (parts.length < 4 || parts[0] !== ORDER_ID_PREFIX) return null;
  const courseId = parts[1];
  const userId = parts[2];
  if (!courseId || !userId) return null;
  return { courseId, userId };
}

/**
 * Extract courseId/userId from Cashfree order_note / tags / notes.
 */
function parseCashfreeOrderMetadata(payload = {}) {
  const note = String(payload.order_note || '');
  const courseId =
    payload.notes?.courseId ||
    payload.order_tags?.courseId ||
    payload.order_meta?.courseId ||
    note.match(/courseId:([^\s|]+)/)?.[1] ||
    null;
  const userId =
    payload.notes?.userId ||
    payload.order_tags?.userId ||
    payload.order_meta?.userId ||
    note.match(/userId:([^\s|]+)/)?.[1] ||
    payload.customer_details?.customer_id ||
    null;
  return {
    courseId: courseId ? String(courseId) : null,
    userId: userId ? String(userId) : null,
  };
}

/**
 * Resolve purchase context for verify/webhook.
 * Prefers PendingPayment, then CF payload metadata, then merchant order id.
 */
async function resolvePurchaseContext(orderId, cfPayload = {}) {
  const pending = await PendingPayment.findOne({ orderId }).lean();
  if (pending) {
    return {
      source: 'pending',
      orderId,
      userId: String(pending.userId),
      courseId: String(pending.courseId),
      amountINR: Number(pending.amountINR),
      currency: pending.currency || 'INR',
      displayCurrency: pending.displayCurrency,
      displayAmount: pending.displayAmount,
      pendingStatus: pending.status,
    };
  }

  const fromCf = parseCashfreeOrderMetadata(cfPayload);
  const fromId = parseMerchantOrderId(orderId);

  const userId = fromCf.userId || fromId?.userId || null;
  const courseId = fromCf.courseId || fromId?.courseId || null;
  const amountINR =
    cfPayload.order_amount != null && !Number.isNaN(Number(cfPayload.order_amount))
      ? Number(cfPayload.order_amount)
      : null;

  if (!userId || !courseId) return null;

  return {
    source: fromCf.courseId ? 'cashfree' : 'orderId',
    orderId,
    userId: String(userId),
    courseId: String(courseId),
    amountINR,
    currency: cfPayload.order_currency || 'INR',
    displayCurrency: undefined,
    displayAmount: undefined,
    pendingStatus: null,
  };
}

async function markPendingFulfilled(orderId) {
  if (!orderId) return;
  await PendingPayment.updateOne(
    { orderId, status: 'pending' },
    { $set: { status: 'fulfilled' } },
  );
}

module.exports = {
  buildMerchantOrderId,
  parseMerchantOrderId,
  parseCashfreeOrderMetadata,
  resolvePurchaseContext,
  markPendingFulfilled,
};
