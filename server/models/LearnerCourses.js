const mongoose = require("mongoose");

const LearnerCoursesSchema = new mongoose.Schema({
  userId: String,
  courses: [
    {
      courseId: String,
      title: String,
      instructorId: String,
      instructorName: String,
      dateOfPurchase: Date,
      courseImage: String,
      totalLessons: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("LearnerCourses", LearnerCoursesSchema);
