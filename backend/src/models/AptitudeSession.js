const mongoose = require("mongoose");

const attemptedQuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  question: String,
  options: [String],
  correctAnswer: String,
  selectedOption: String,
  isCorrect: Boolean,
  explanation: String,
  difficultyLevel: Number,
});

const aptitudeSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 NEW REQUIREMENT: Student ki email store karne ke liye
    // Isse Admin Dashboard par "Unknown" ki jagah real email dikhegi
    studentEmail: {
      type: String,
      default: "Unknown",
    },

    category: {
      type: String,
      required: true,
    },

    // 🔥 Adaptive Difficulty Level
    // 1 = easy
    // 2 = medium
    // 3 = hard
    currentLevel: {
      type: Number,
      default: 2,
      min: 1,
      max: 3,
    },

    questionNumber: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 20,
    },

    score: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    attemptedQuestions: [attemptedQuestionSchema],

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

// 🔥 Performance optimization
aptitudeSessionSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model("AptitudeSession", aptitudeSessionSchema);