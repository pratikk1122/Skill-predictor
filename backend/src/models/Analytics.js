const mongoose = require("mongoose");

/* ================= ANALYTICS SCHEMA ================= */

const analyticsSchema = new mongoose.Schema({

  /* ================= STUDENT ================= */

  studentId: {
    type: String,
    required: true,
    unique: true
  },

  /* ================= PERFORMANCE SCORES ================= */

  resumeScore: {
    type: Number,
    default: 0
  },

  aptitudeScore: {
    type: Number,
    default: 0
  },

  interviewScore: {
    type: Number,
    default: 0
  },

  gdScore: {
    type: Number,
    default: 0
  },

  /* ================= SKILL RADAR ================= */

  communication: {
    type: Number,
    default: 0
  },

  technical: {
    type: Number,
    default: 0
  },

  problemSolving: {
    type: Number,
    default: 0
  },

  confidence: {
    type: Number,
    default: 0
  },

  leadership: {
    type: Number,
    default: 0
  },

  /* ================= ACTIVITY COUNTERS ================= */

  aptitudeTests: {
    type: Number,
    default: 0
  },

  interviewMocks: {
    type: Number,
    default: 0
  },

  gdSessions: {
    type: Number,
    default: 0
  },

  resumeUploads: {
    type: Number,
    default: 0
  },

  /* ================= AI INSIGHTS ================= */

  aiInsights: {
    type: String,
    default: ""
  },

  improvementSuggestions: {
    type: [String],
    default: []
  },

  /* ================= CAREER ================= */

  predictedCareer: {
    type: String,
    default: ""
  },

  /* ================= TIMESTAMP ================= */

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

});

/* ================= MODEL ================= */

module.exports = mongoose.model("Analytics", analyticsSchema);