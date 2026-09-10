const express = require("express");
const router = express.Router();

const {
  getInterviewSummary,
  getStudentInterviews,
  deleteInterview,
  resetInterview,
  getInterviewAnalytics, // 🔥 Ab ye "Full Dashboard Analytics" handle karta hai
} = require("../controllers/adminInterview.controller");

const authMiddleware = require("../middleware/auth.middleware");

/* =====================================================
    ADMIN ROLE CHECK
===================================================== */
const adminCheck = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};

/* =====================================================
    🔥 ANALYTICS ROUTE (Master Data for Dashboard Cards)
    Logic: Fetches Interview, Resume, GD, Aptitude & Prep Stats
    GET /api/admin/interviews/analytics/summary
===================================================== */
router.get(
  "/analytics/summary",
  authMiddleware,
  adminCheck,
  getInterviewAnalytics
);

/* =====================================================
    🔥 INTERVIEW SUMMARY (GROUPED BY STUDENT)
    GET /api/admin/interviews
===================================================== */
router.get(
  "/",
  authMiddleware,
  adminCheck,
  getInterviewSummary
);

/* =====================================================
    🔥 RESET INTERVIEW
    PUT /api/admin/interviews/reset/:sessionId
===================================================== */
router.put(
  "/reset/:sessionId",
  authMiddleware,
  adminCheck,
  resetInterview
);

/* =====================================================
    🔥 DELETE INTERVIEW
    DELETE /api/admin/interviews/:sessionId
===================================================== */
router.delete(
  "/:sessionId",
  authMiddleware,
  adminCheck,
  deleteInterview
);

/* =====================================================
    🔥 GET ALL INTERVIEWS OF ONE STUDENT
    (KEEP LAST — VERY IMPORTANT)
    GET /api/admin/interviews/:studentId
===================================================== */
router.get(
  "/:studentId",
  authMiddleware,
  adminCheck,
  getStudentInterviews
);

module.exports = router;