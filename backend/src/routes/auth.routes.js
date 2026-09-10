const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

// ✅ AUTH CONTROLLERS
const {
  sendOtp,
  verifyOtp,
  loginWithPassword,
  forgotPassword,
  verifyResetOtp, 
  resetPassword,
  changePassword,
  logout,
  submitQuery,
  getPublicStats // ✅ CORRECT: yahin se aayega
} = require("../controllers/auth.controller");

/* =====================================================
    AUTH ROUTES
===================================================== */

// 🔐 SEND OTP (Signup/Login)
router.post("/send-otp", sendOtp);

// 🔐 VERIFY OTP (Signup/Login)
router.post("/verify-otp", verifyOtp);

// 🔐 LOGIN WITH PASSWORD
router.post("/login-password", loginWithPassword);

/* -----------------------------------------------------
    🔄 FORGOT & CHANGE PASSWORD FLOW
----------------------------------------------------- */

// 1️⃣ Step 1: Send Reset OTP
router.post("/forgot-password", forgotPassword);

// 2️⃣ Step 2: Verify OTP for Reset
router.post("/verify-reset-otp", verifyResetOtp);

// 3️⃣ Step 3: Final Password Update
router.post("/reset-password", resetPassword);

// 🆕 CHANGE PASSWORD (Inside Admin Dashboard)
router.post("/change-password", authMiddleware, changePassword);

/* -----------------------------------------------------
    🚪 SESSION MANAGEMENT
----------------------------------------------------- */

// 🔓 LOGOUT
router.post("/logout", authMiddleware, logout);

/* =====================================================
    LANDING PAGE ROUTES
===================================================== */

// 📩 SUBMIT QUERY FROM CONTACT FORM
router.post("/submit-query", submitQuery);

// 📊 GET PUBLIC STATS (REAL-TIME COUNTERS)
router.get("/stats", getPublicStats);

/* =====================================================
    PROTECTED TEST ROUTE
==================================================== */
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user
  });
});

module.exports = router;
