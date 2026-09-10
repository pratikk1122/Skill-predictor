const mongoose = require("mongoose");

const resumeScorerSchema = new mongoose.Schema(
  {
    // 🔥 REQUIREMENT: Added 'userId' field to sync with Analytics Controller
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Jis student ne resume scan kiya hai uski ID (Legacy Field - Safe)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    
    // Student ka email (Dashboard ya logs ke liye useful rahega)
    email: {
      type: String,
      default: "Unknown"
    },
    
    // Resume ka overall ATS score
    score: {
      type: Number,
      default: 0
    },
    
    // Jo file upload ki thi uska naam
    filename: {
      type: String,
      default: ""
    },
    
    // Scan kab hua tha uski date & time
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true // Ye automatically createdAt aur updatedAt fields add kar dega 
  }
);

// Ye ban gaya aapka naya collection "resumescorers"
module.exports = mongoose.model("ResumeScorer", resumeScorerSchema);