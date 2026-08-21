const mongoose = require("mongoose");

const ContentBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["paragraph", "heading"], required: true },
    text: { type: String, required: true, trim: true, maxlength: 20000 },
  },
  { _id: false }
);

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    readTime: { type: String, required: true, trim: true, maxlength: 40 },
    image: { type: String, trim: true, default: "" },
    content: { type: [ContentBlockSchema], default: [] },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogPostSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model("BlogPost", BlogPostSchema);
