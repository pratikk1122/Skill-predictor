const express = require("express");
const router = express.Router();

/* ================= IMPORT CONTROLLER & MIDDLEWARE ================= */
// 🔥 FIXED: Name changed from 'analytics.controller' to 'analyticsController' to match your file
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/auth.middleware"); 

/* ===================================================== */
/* ================= PERFORMANCE OVERVIEW =============== */
/* ===================================================== */

router.get(
  "/performance/:studentId",
  authMiddleware, 
  analyticsController.getPerformanceOverview
);


/* ===================================================== */
/* ================= SKILL RADAR ======================== */
/* ===================================================== */

router.get(
  "/skills/:studentId",
  authMiddleware,
  analyticsController.getSkillRadar
);


/* ===================================================== */
/* ================= CAREER PREDICTION ================= */
/* ===================================================== */

router.get(
  "/career/:studentId",
  authMiddleware,
  analyticsController.getCareerPrediction
);


/* ===================================================== */
/* ================= WEAKNESS DETECTION ================= */
/* ===================================================== */

router.get(
  "/weakness/:studentId",
  authMiddleware,
  analyticsController.detectWeakness
);


/* ===================================================== */
/* ================= AI STUDY PLAN ====================== */
/* ===================================================== */

router.get(
  "/study-plan/:studentId",
  authMiddleware,
  analyticsController.generateStudyPlan
);


/* ===================================================== */
/* ================= ACTIVITY ANALYTICS ================= */
/* ===================================================== */

router.get(
  "/activity/:studentId",
  authMiddleware,
  analyticsController.getActivityAnalytics
);


/* ===================================================== */
/* ================= RESUME ANALYTYTICS ================= */
/* ===================================================== */

router.get(
  "/resume/:studentId",
  authMiddleware,
  analyticsController.getResumeAnalytics
);


/* ===================================================== */
/* ================= INTERVIEW ANALYTICS ================ */
/* ===================================================== */

router.get(
  "/interview/:studentId",
  authMiddleware,
  analyticsController.getInterviewAnalytics
);


/* ===================================================== */
/* ================= APTITUDE ANALYTICS ================= */
/* ===================================================== */

router.get(
  "/aptitude/:studentId",
  authMiddleware,
  analyticsController.getAptitudeAnalytics
);


/* ===================================================== */
/* ================= COMPANY APTITUDE =================== */
/* ===================================================== */

router.get(
  "/company-aptitude/:studentId",
  authMiddleware,
  analyticsController.getCompanyAptitude
);


/* ===================================================== */
/* ================= GROUP DISCUSSION =================== */
/* ===================================================== */

router.get(
  "/gd/:studentId",
  authMiddleware,
  analyticsController.getGDAnalytics
);


/* ===================================================== */
/* ================= AI INSIGHTS ======================== */
/* ===================================================== */

router.get(
  "/insights/:studentId",
  authMiddleware,
  analyticsController.getAIInsights
);


/* ===================================================== */
/* ================= IMPROVEMENT SUGGESTIONS ============ */
/* ===================================================== */

router.get(
  "/improvement-suggestions/:studentId",
  authMiddleware,
  analyticsController.getImprovementSuggestions
);


/* ===================================================== */
/* ================= DOWNLOAD REPORT ==================== */
/* ===================================================== */

router.get(
  "/report/:studentId",
  authMiddleware,
  analyticsController.downloadFullReport
);

/* ================= ADMIN DASHBOARD SUMMARY ================= */

router.get(
  "/admin/summary",
  authMiddleware,
  analyticsController.getAdminSummary
);


/* ===================================================== */

module.exports = router;