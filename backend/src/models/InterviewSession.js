const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 NEW REQUIREMENT: userId field for Real-time Analytics Sync
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resumeText: {
      type: String,
      required: true,
    },

    resumeAnalysis: {
      roleDetected: String,
      experienceLevel: String,
      skills: [String],
      strengths: [String],
      weakAreas: [String],
    },

    /* =====================================================
       🔥 NEW FIELD: DIFFICULTY LEVEL (SAFE ADDITION)
       - Default "medium" so old workflow unaffected
    ===================================================== */
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // 🔥 NEW REQUIREMENT: Feedback summary for Radar/Spider Charts in Analytics
    feedback: {
      communication: { type: Number, default: 5 },
      technical: { type: Number, default: 5 },
      confidence: { type: Number, default: 5 },
    },

    transcript: [
      {
        question: String,
        answer: String,
        feedback: {
          technical_score: {
            type: Number,
            default: 0,
          },
          communication_score: {
            type: Number,
            default: 0,
          },
          confidence_score: {
            type: Number,
            default: 0,
          },

          // 🔥 UPDATED STRUCTURE (Object Based)
          improvement: [
            {
              category: {
                type: String,
              },
              description: {
                type: String,
              },
            },
          ],
        },
      },
    ],

    totalQuestions: {
      type: Number,
      default: 5,
    },

    overallScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);