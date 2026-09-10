const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getAllStudents,
  blockStudent,
  unblockStudent,
  getDashboardStats,
  deleteStudent,
  getAllQueries,
  getActivityLogs,
  resolveQuery,
  handleAIQuery,
  getAISuggestion,
  getHelpdeskAnalytics,
  // 🔥 NEW: Notification Controller Imports
  getNotifications,
  markNotificationRead,
  clearAllNotifications,
  // 🔥 NEW: Placement Tracking Controller Imports
  getPlacementAnalytics,
  updateApplicationStatus
} = require("../controllers/admin.controller");

// ✅ NEW: Company Routes (SAFE IMPORT)
const companyRoutes = require("./company.routes");

/* =========================================
   ADMIN GUARD (UNCHANGED)
========================================= */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/* =========================================
   ROUTES
========================================= */

// 📊 DASHBOARD DATA
router.get("/dashboard", authMiddleware, adminOnly, getDashboardStats);

// 🔥 HELPDESK ANALYTICS
router.get("/helpdesk-analytics", authMiddleware, adminOnly, getHelpdeskAnalytics);

// 👨‍🎓 STUDENTS
router.get("/students", authMiddleware, adminOnly, getAllStudents);

// 🚫 BLOCK STUDENT
router.patch("/students/:id/block", authMiddleware, adminOnly, blockStudent);

// 🔓 UNBLOCK STUDENT
router.patch("/students/:id/unblock", authMiddleware, adminOnly, unblockStudent);

// 🗑 DELETE STUDENT
router.delete("/students/:id", authMiddleware, adminOnly, deleteStudent);

// ❓ HELPDESK / QUERIES
router.get("/queries", authMiddleware, adminOnly, getAllQueries);

// 🔥 GET AI SUGGESTION
router.post("/queries/suggest", authMiddleware, adminOnly, getAISuggestion);

// ✅ RESOLVE QUERY
router.patch(
  "/queries/:userId/:queryId/resolve",
  authMiddleware,
  adminOnly,
  resolveQuery
);

/* =========================================
   🔥 NEW: NOTIFICATION ROUTES
========================================= */

// 1. Get all admin notifications
router.get("/notifications", authMiddleware, adminOnly, getNotifications);

// 2. Mark specific notification as read
router.patch("/notifications/:id/read", authMiddleware, adminOnly, markNotificationRead);

// 3. Clear all notifications
// Humne yahan DELETE method barkarar rakha hai kyunki controller ab deleteMany use kar raha hai
router.delete("/notifications/clear", authMiddleware, adminOnly, clearAllNotifications);

/* =========================================
   🔥 NEW: PLACEMENT TRACKING ROUTES
========================================= */

// 1. Get detailed placement stats and milestones
router.get("/placements/analytics", authMiddleware, adminOnly, getPlacementAnalytics);

// 2. Update student application status (Selected/Rejected etc)
router.patch("/placements/update-status", authMiddleware, adminOnly, updateApplicationStatus);

/* =========================================
   🔥 AI CHATBOT ROUTE (Landing Page)
   Endpoint: POST /api/admin/ask-ai
========================================= */
router.post("/ask-ai", handleAIQuery);

/* =========================================
   ACTIVITY LOGS ROUTES (SECURED)
========================================= */

// Get all logs
router.get("/logs", authMiddleware, adminOnly, getActivityLogs);

/* =========================================
   ✅ COMPANY MANAGEMENT ROUTES (NEW)
   BASE: /api/admin/companies
========================================= */
router.use(
  "/companies",
  authMiddleware,
  adminOnly,
  companyRoutes
);

module.exports = router;