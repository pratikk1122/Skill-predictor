const mongoose = require("mongoose");

// Message Schema for Transcript
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const gdRoomSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  type: { type: String, enum: ["AI", "LIVE"], default: "AI" },
  
  // 🔥 FEATURE 3: Store the selected difficulty level
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  
  // 🔥 STATUS: To filter completed sessions for Dashboard history
  status: { type: String, enum: ["active", "completed"], default: "active" },
  
  participants: [{ type: String }],
  messages: [messageSchema],

  // 🔥 FEATURE 4: Detailed AI Analytics and Feedback
  // Using Mixed or Object to store the complex report data we generate in controller
  finalStats: {
    score: { type: Number, default: 0 },
    fillers: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    aiFeedback: { type: String },
    detailedMetrics: {
      communication: Number,
      criticalThinking: Number,
      confidence: Number
    },
    highlights: [
      {
        text: String,
        quality: String,
        reason: String
      }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.models.GD_Room || mongoose.model("GD_Room", gdRoomSchema);