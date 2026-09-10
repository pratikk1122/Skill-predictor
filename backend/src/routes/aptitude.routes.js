const express = require("express");
const router = express.Router();

// 🔥 IMPORTANT: must be a FUNCTION
const authMiddleware = require("../middleware/auth.middleware");

const {
  startAptitudeTest,
  getNextQuestion,
  submitAnswer,
} = require("../controllers/aptitude.controller");

const {
  getAptitudeHistory,
  getAptitudeAnalytics,
} = require("../controllers/aptitude.analytics.controller");

/* =====================================================
   ✅ HEALTH CHECK
===================================================== */
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Aptitude routes OK" });
});

/* =====================================================
   ✅ START TEST
   - Creates adaptive aptitude session
===================================================== */
router.post("/start", authMiddleware, startAptitudeTest);

/* =====================================================
   ✅ GET NEXT QUESTION (LIVE ADAPTIVE)
   - Returns one question at a time
===================================================== */
router.get("/next", authMiddleware, getNextQuestion);

/* =====================================================
   ✅ SUBMIT ANSWER (LIVE ADAPTIVE SYNC)
   - Evaluates answer & Updates Real-time Score in DB
   - Adjusts difficulty
===================================================== */
// 🔥 REQUIREMENT CHECK: This route matches the axios.post in AptitudeTest.jsx
router.post("/submit-answer", authMiddleware, submitAnswer);

/* =====================================================
   🆕 HISTORY API (ADVANCED)
===================================================== */
router.get("/history", authMiddleware, getAptitudeHistory);

/* =====================================================
   🆕 ANALYTICS API (ADVANCED)
===================================================== */
router.get("/analytics", authMiddleware, getAptitudeAnalytics);

/* =====================================================
   ✅ DEBUG ROUTE (SAFE)
===================================================== */
router.get("/debug/auth-check", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Auth middleware working",
    userId: req.user?.id || req.user?._id || null,
  });
});

module.exports = router;