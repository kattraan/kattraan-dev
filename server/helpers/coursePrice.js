function clampDiscount(discount) {
  const n = Number(discount) || 0;
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** Payable INR after optional % discount. */
function salePriceINR(course) {
  const price = Number(course?.price) || 0;
  if (price <= 0) return 0;
  const discounted = price * (1 - clampDiscount(course?.discount) / 100);
  return Number(Math.max(0, discounted).toFixed(2));
}

function paidOrderMatch() {
  return {
    paymentStatus: 'paid',
    orderStatus: { $nin: ['cancelled', 'refunded'] },
  };
}

function capturedInrExpr() {
  return {
    $cond: [
      { $gt: [{ $ifNull: ['$amountINR', 0] }, 0] },
      '$amountINR',
      { $ifNull: ['$coursePricing', 0] },
    ],
  };
}

/**
 * Checkout tests (₹1 / ₹20) are not treated as course revenue.
 * Real paid courses on this platform are priced at ₹99+.
 */
const MIN_COURSE_REVENUE_INR = 50;

function paidAmountExpr() {
  return {
    $let: {
      vars: { captured: capturedInrExpr() },
      in: {
        $cond: [{ $gte: ['$$captured', MIN_COURSE_REVENUE_INR] }, '$$captured', 0],
      },
    },
  };
}

module.exports = {
  salePriceINR,
  paidOrderMatch,
  paidAmountExpr,
  MIN_COURSE_REVENUE_INR,
};
