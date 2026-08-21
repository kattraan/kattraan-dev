const mongoose = require("mongoose");

const SINGLETON_KEY = "homepage";

const HomepageFeaturedSchema = new mongoose.Schema(
  {
    key: { type: String, default: SINGLETON_KEY, unique: true },
    trendingCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    popularCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

HomepageFeaturedSchema.statics.SINGLETON_KEY = SINGLETON_KEY;

module.exports = mongoose.model("HomepageFeatured", HomepageFeaturedSchema);
