const mongoose = require("mongoose");

const EnrolledCourseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    title: { type: String, default: "Untitled Course" },
    instructorId: { type: String, default: "" },
    instructorName: { type: String, default: "Instructor" },
    dateOfPurchase: { type: Date, default: Date.now },
    courseImage: { type: String, default: "" },
    totalLessons: { type: Number, default: 0 },
  },
  { _id: false },
);

const LearnerCoursesSchema = new mongoose.Schema(
  {
    // Unique per learner — prevents duplicate enrollment containers under concurrency.
    userId: { type: String, required: true, unique: true, index: true },
    courses: {
      type: [EnrolledCourseSchema],
      default: [],
    },
  },
  { timestamps: true },
);

LearnerCoursesSchema.index({ "courses.courseId": 1 });

module.exports = mongoose.model("LearnerCourses", LearnerCoursesSchema);
