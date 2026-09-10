const mongoose = require("mongoose");

const companyPrepSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // 🔥 NEW: Student ki email store karne ke liye
    studentEmail: {
      type: String,
      default: "Unknown"
    },
    companyName: {
      type: String,
      required: true,
      default: "Unknown Company"
    },
    moduleName: {
      type: String,
      default: "Mock Test"
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started"
    },
    accessedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyPrep", companyPrepSchema);