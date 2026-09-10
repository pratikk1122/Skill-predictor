const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    
    // ================= OTP & SESSION MANAGEMENT =================
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpSentAt: { type: Date, default: null },
    lastOtpVerifiedAt: { type: Date, default: null },
    forceOtpOnNextLogin: { type: Boolean, default: false },
    activeSessionId: { type: String, default: null },
    isFirstLogin: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    
    // ================= USER PROFILE & ROLE =================
    role: { type: String, enum: ["admin", "student"], default: "student" },
    firstName: { type: String, default: null },
    surName: { type: String, default: null },
    mobile: { type: String, default: null },
    education: { type: String, default: null },
    course: { type: String, default: null },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    profileImage: { type: String, default: null }, 

    // ================= FORGOT PASSWORD =================
    resetPasswordOtp: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // ================= APPLICATION TRACKING =================
    applications: {
      type: [
        {
          companyName: String,
          jobRole: String,
          status: { type: String, enum: ["Applied", "In-Review", "Selected", "Rejected"], default: "Applied" },
          appliedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    // ================= 🔥 ANALYTICS TRACKING FIELDS 🔥 =================
    
    resumeScorer: {
      type: [
        {
          score: Number,
          filename: String,
          date: { type: Date, default: Date.now }, 
          analyzedAt: { type: Date, default: Date.now }
        }
      ],
      default: [] 
    },

    aptitudeResults: {
      type: [
        {
          category: String,
          score: Number,
          totalQuestions: Number,
          completedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    groupDiscussions: {
      type: [
        {
          roomId: String,
          topic: String,
          mode: String,
          joinedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    companyPrep: {
      type: [
        {
          companyName: String,
          moduleName: String,
          accessedAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    interviewHistory: {
      type: [
        {
          company: { type: String, required: true },      
          questionText: { type: String, required: true }, 
          difficulty: { type: String },    
          score: { type: Number, default: 0 },         
          isCorrect: { type: Boolean, default: false },     
          userAnswer: { type: String, default: null },     
          timestamp: { type: Date, default: Date.now }
        }
      ],
      default: []
    },

    // ================= HELPDESK / QUERIES (UPDATED) =================
    queries: {
      type: [
        {
          studentName: String,
          queryContent: String,
          reply: String,
          status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
          // 🔥 NEW FIELD: Tracks if AI or Admin resolved it
          resolvedBy: { type: String, enum: ["AI", "Admin", null], default: null }, 
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);