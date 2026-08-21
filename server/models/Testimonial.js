const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    journey: { type: String, required: true, trim: true, maxlength: 160 },
    date: { type: String, required: true, trim: true, maxlength: 40 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TestimonialSchema.index({ sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model("Testimonial", TestimonialSchema);
