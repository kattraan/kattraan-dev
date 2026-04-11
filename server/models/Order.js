const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userEmail: String,
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  orderDate: Date,
  paymentId: String,
  payerId: String,
  instructorId: String,
  instructorName: String,
  courseImage: String,
  courseTitle: String,
  courseId: String,
  coursePricing: Number,      // Amount charged (always in INR)
  currency: { type: String, default: 'INR' },          // Charge currency (INR)
  displayAmount: Number,      // Converted amount shown to user in their local currency
  displayCurrency: String,    // User's local currency code at time of purchase (e.g. 'USD')
});

module.exports = mongoose.model("Order", OrderSchema);
