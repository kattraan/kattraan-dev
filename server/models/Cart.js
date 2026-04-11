const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  title: { type: String, default: '' },
  price: { type: Number, default: 0 },
  thumbnail: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

CartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', CartSchema);
