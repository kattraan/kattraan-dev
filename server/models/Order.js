const mongoose = require("mongoose");

/**
 * Order ids are stored as strings for compatibility with existing documents
 * and Cashfree/client payloads. Status/method fields are strictly enum-typed.
 */
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "", index: true },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "confirmed",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cashfree"],
      default: "cashfree",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",
      index: true,
    },
    orderDate: { type: Date, default: Date.now, index: true },
    paymentId: { type: String, index: true, unique: true, sparse: true },
    payerId: { type: String },
    instructorId: { type: String, index: true },
    instructorName: { type: String, default: "" },
    courseImage: { type: String, default: "" },
    courseTitle: { type: String, default: "" },
    courseId: { type: String, required: true, index: true },
    coursePricing: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    displayAmount: { type: Number },
    displayCurrency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, courseId: 1 });
OrderSchema.index({ orderDate: -1 });

module.exports = mongoose.model("Order", OrderSchema);
