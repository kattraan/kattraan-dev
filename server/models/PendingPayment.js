const mongoose = require('mongoose');

/**
 * Local record of a Cashfree checkout session so webhooks/verify can
 * resolve courseId + userId + expected amount without trusting client body
 * or Cashfree order_note round-trip.
 */
const PendingPaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    amountINR: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    displayCurrency: String,
    displayAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true },
);

// Auto-expire unfinished checkouts after 48 hours
PendingPaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 48 * 60 * 60 });

module.exports = mongoose.model('PendingPayment', PendingPaymentSchema);
