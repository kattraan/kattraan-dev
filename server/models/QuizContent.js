const mongoose = require("mongoose");
const Content = require("./Content");

const QuizContentSchema = new mongoose.Schema({
  questions: [
    {
      question: { type: String, required: true },
      type: {
        type: String,
        enum: ["single", "multiple", "subjective"],
        default: "single"
      },
      options: [{ type: String }], // Optional for subjective
      correctAnswer: { type: Number }, // Index for single
      correctAnswers: [{ type: Number }], // Indices for multiple
      marks: { type: Number, default: 1 },
      image: { type: String }, // URL if imageEnabled is true
    },
  ],
});

module.exports = Content.discriminator("quiz", QuizContentSchema);
