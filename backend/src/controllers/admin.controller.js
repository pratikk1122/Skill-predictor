const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { sendQueryResolvedEmail } = require("../utils/sendOtp"); 
const mongoose = require("mongoose");

// 🔥 NEW IMPORTS FOR REAL COUNTS
const ResumeScorer = require("../models/ResumeScorer"); 
const AptitudeSession = require("../models/AptitudeSession"); // Aptitude ka real collection
const CompanyPrep = require("../models/CompanyPrep"); // Ye naya collection hum banayenge

// 🔥 NEW GD COLLECTIONS IMPORTS
const AiGD = require("../models/AiGD");
const LiveGD = require("../models/LiveGD");

// 🔥 NEW IMPORT: AI Response Service
const { generateAIResponse } = require("../services/aiResponse.service");

// 🔥 NEW IMPORT: Notification Model
const Notification = require("../models/Notification");

/* =========================================
    ✅ HELPER: createLog
========================================= */
const createLog = async (req, action, targetEmail, details) => {
  try {
    const adminUser = await User.findById(req.user.id);
    const adminName = adminUser ? `${adminUser.firstName || "Admin"}` : "Admin";

    await ActivityLog.create({
      adminId: req.user.id,
      adminEmail: req.user.email,
      adminName: adminName,
      action,
      targetEmail,
      details
    });
  } catch (err) {
    console.error("LOGGING ERROR", err);
  }
};

/* =========================================
    🔥 UPDATED: HANDLE AI AUTO-REPLY QUERY
    Processes Landing Page chatbot queries.
========================================= */
exports.handleAIQuery = async (req, res) => {
  try {
    const { name, email, query } = req.body;

    // 1. AI Response Logic (Now calling the professional Knowledge Base Service)
    const aiGeneratedReply = await generateAIResponse(query);

    // 2. Save to User queries array with "Resolved" status because AI handled it
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { 
        $push: { 
          queries: { 
            studentName: name, 
            queryContent: query, 
            reply: aiGeneratedReply, 
            status: "Resolved",
            resolvedBy: "AI" // 🔥 NEW: Tracking that AI solved this for analytics
          } 
        } 
      },
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      reply: aiGeneratedReply,
      message: "Query processed by AI and saved to helpdesk" 
    });

  } catch (error) {
    console.error("AI CHATBOT ERROR 👉", error);
    res.status(500).json({ success: false, message: "Chatbot is currently unavailable" });
  }
};

/**
 * 🔥 NEW: GET AI SUGGESTION FOR PENDING QUERY
 * Dashboard par Admin kisi bhi query ke liye AI draft maang sakta hai.
 */
exports.getAISuggestion = async (req, res) => {
  try {
    const { queryContent } = req.body;
    if (!queryContent) return res.status(400).json({ message: "Query content required" });

    const suggestion = await generateAIResponse(`Draft a professional helpdesk reply for: ${queryContent}`);
    res.json({ success: true, suggestion });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate suggestion" });
  }
};

/**
 * 🔥 NEW: GET HELPDESK ANALYTICS
 * Shows Total Queries, AI Success Rate, and Pending tasks.
 */
exports.getHelpdeskAnalytics = async (req, res) => {
  try {
    const users = await User.find({ "queries.0": { $exists: true } }).select("queries");
    
    let totalQueries = 0;
    let aiResolved = 0;
    let pending = 0;

    users.forEach(u => {
      u.queries.forEach(q => {
        totalQueries++;
        if (q.status === "Pending") pending++;
        // 🔥 Updated filter to catch queries explicitly resolved by AI
        if (q.resolvedBy === "AI") aiResolved++;
      });
    });

    res.json({
      totalQueries,
      aiResolved,
      pending,
      efficiency: totalQueries > 0 ? ((aiResolved / totalQueries) * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch helpdesk analytics" });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const { image } = req.body; 
    if (!image) return res.status(400).json({ message: "No image data provided" });

    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== "admin") return res.status(403).json({ message: "Unauthorized access" });

    admin.profileImage = image;
    await admin.save();
    await createLog(req, "UPDATE_PROFILE_PIC", admin.email, `Admin updated their profile picture`);

    res.json({ success: true, message: "Profile picture updated successfully", profileImage: admin.profileImage });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile picture" });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const studentsJoined = await User.countDocuments({ role: "student" });
    const mockInterviewsData = await User.aggregate([
      { $match: { role: "student" } },
      { $project: { count: { $size: { $ifNull: ["$interviews", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);
    const totalInterviews = mockInterviewsData.length > 0 ? mockInterviewsData[0].total : 0;
    const totalQuestions = 10000 + (studentsJoined * 5);
    const companyCount = 26; 

    res.json({
      success: true,
      stats: {
        studentsJoined,
        mockInterviews: totalInterviews > 0 ? totalInterviews : 1250, 
        questions: totalQuestions,
        companies: companyCount,
        support: "24/7"
      }
    });
  } catch (error) {
    console.error("GET PUBLIC STATS ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password -otp -resetPasswordOtp")
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.blockStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student") return res.status(400).json({ message: "Only student accounts can be blocked" });

    student.isBlocked = true;
    await student.save();
    await createLog(req, "BLOCK_STUDENT", student.email, `Admin blocked student ${student.email}`);
    res.json({ message: "Student blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.unblockStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student") return res.status(400).json({ message: "Only student accounts can be unblocked" });

    student.isBlocked = false;
    await student.save();
    await createLog(req, "UNBLOCK_STUDENT", student.email, `Admin unblocked student ${student.email}`);
    res.json({ message: "Student unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================
    ✅ ADMIN DASHBOARD STATS 
========================================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const verifiedStudents = await User.countDocuments({ role: "student", isVerified: true });
    const blockedStudents = await User.countDocuments({ role: "student", isBlocked: true });

    const recentStudents = await User.find({ role: "student" })
      .select("email isVerified isBlocked createdAt lastLoginAt course")
      .sort({ createdAt: -1 })
      .limit(10);

    const placementTrends = await User.aggregate([
      { $match: { role: "student" } },
      { $unwind: "$applications" },
      { $match: { "applications.status": "Selected" } },
      {
        $group: {
          _id: { $month: "$applications.appliedAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const appTracking = await User.aggregate([
      { $match: { role: "student" } },
      { $unwind: "$applications" },
      {
        $group: {
          _id: "$applications.status",
          count: { $sum: 1 }
        }
      }
    ]);

    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(5);
    const pendingQueries = await User.countDocuments({ "queries.status": "Pending" });

    // ============================== NEW DASHBOARD ANALYTICS ==============================
    
    const totalResumes = await ResumeScorer.countDocuments();

    let totalAptitudeTests = 0;
    try {
      totalAptitudeTests = await AptitudeSession.countDocuments();
    } catch (e) {
      console.log("AptitudeSession check skipped temporarily");
    }

    const gdData = await User.aggregate([
      { $project: { count: { $size: { $ifNull: ["$groupDiscussions", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);
    const totalGDParticipants = gdData.length > 0 ? gdData[0].total : 0;

    let totalCompanyModules = 0;
    try {
      totalCompanyModules = await CompanyPrep.countDocuments();
    } catch (e) {
      console.log("CompanyPrep model not found yet, defaulting to 0");
    }

    // 🔥 UPDATED: GET REAL COUNTS FROM SEPARATE COLLECTIONS (AI GD & LIVE GD)
    const totalAiGD = await AiGD.countDocuments();
    const totalLiveGD = await LiveGD.countDocuments();

    // 🔥 NEW REQUIREMENT: Placement Quick Stats for Dashboard
    const totalApplications = await User.aggregate([
      { $project: { count: { $size: { $ifNull: ["$applications", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    const topCompanies = await User.aggregate([
      { $unwind: "$applications" },
      { $group: { _id: "$applications.companyName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalStudents,
      verifiedStudents,
      blockedStudents,
      recentStudents,
      placementTrends,
      appTracking,
      logs,
      pendingQueries,
      totalResumes,
      totalAptitudeTests,
      totalGDParticipants,
      totalCompanyModules,
      totalAiGD, // 🔥 REAL AI GD COUNT FROM COLLECTION
      totalLiveGD, // 🔥 REAL LIVE GD COUNT FROM COLLECTION
      totalApplications: totalApplications.length > 0 ? totalApplications[0].total : 0,
      topCompanies
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student") return res.status(400).json({ message: "Only student accounts can be deleted" });

    const email = student.email;
    await student.deleteOne();
    await createLog(req, "DELETE_STUDENT", email, `Admin deleted student ${email} permanently`);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllQueries = async (req, res) => {
  try {
    const usersWithQueries = await User.find({ "queries.0": { $exists: true } }).select("email queries").sort({ "queries.createdAt": -1 });
    let allQueries = [];
    usersWithQueries.forEach(user => {
      user.queries.forEach(q => {
        allQueries.push({ 
          userId: user._id, 
          queryId: q._id, 
          email: user.email, 
          studentName: q.studentName,
          queryContent: q.queryContent, 
          status: q.status, 
          resolvedBy: q.resolvedBy || "Admin", // 🔥 TRACK: Check if resolved by AI or Admin
          createdAt: q.createdAt 
        });
      });
    });
    allQueries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allQueries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch queries" });
  }
};

exports.resolveQuery = async (req, res) => {
  try {
    const { userId, queryId } = req.params;
    const { customReply } = req.body; // 🔥 NEW: Admin can now send a custom reply
    const userToNotify = await User.findById(userId);
    if (!userToNotify) return res.status(404).json({ message: "User not found" });

    const targetQuery = userToNotify.queries.find(q => q._id.toString() === queryId);
    if (!targetQuery) return res.status(404).json({ message: "Query not found" });

    const finalReply = customReply || "Your query has been resolved by SkillPredictor Support.";

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "queries._id": queryId },
      { 
        $set: { 
          "queries.$.status": "Resolved",
          "queries.$.reply": finalReply,
          "queries.$.resolvedBy": "Admin" // 🔥 Manual Resolution Track
        } 
      },
      { new: true }
    );

    // 🔥 NOTIFICATION CLEANUP: Mark related notification as read
    await Notification.updateMany(
      { relatedUser: userId, type: "query" },
      { $set: { isRead: true } }
    );

    sendQueryResolvedEmail(updatedUser.email, targetQuery.queryContent, finalReply).catch(err => console.error(err));
    await createLog(req, "RESOLVE_QUERY", updatedUser.email, `Admin resolved query manually`);
    res.json({ message: "Query resolved and email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================
    🔥 NEW: NOTIFICATION MANAGEMENT
========================================= */

// 1. Fetch All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientRole: "admin" })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// 2. Mark Single as Read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

// 3. Clear All (MODIFIED: Now deletes to ensure UI updates)
exports.clearAllNotifications = async (req, res) => {
  try {
    // UPDATED LOGIC: updateMany ki jagah deleteMany use kiya hai
    await Notification.deleteMany({ recipientRole: "admin" });
    
    // Existing response flow maintained
    res.json({ success: true, message: "All notifications cleared from database" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error clearing notifications" });
  }
};

exports.adminLogout = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin && admin.role === "admin") {
      admin.forceOtpOnNextLogin = true;
      admin.activeSessionId = null;
      await admin.save();
    }
    res.json({ message: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

/* =========================================
    🔥 REQUIREMENT: PLACEMENT TRACKING LOGIC
========================================= */

// 1. Get Detailed Placement Analytics & Table Data
exports.getPlacementAnalytics = async (req, res) => {
  try {
    const users = await User.find({ role: "student" })
      .select("firstName surName email applications groupDiscussions aptitudeResults resumeScorer");

    let placementData = [];

    users.forEach(user => {
      user.applications.forEach(app => {
        placementData.push({
          applicationId: app._id,
          userId: user._id,
          studentName: `${user.firstName || ""} ${user.surName || ""}`.trim() || user.email,
          studentEmail: user.email,
          companyName: app.companyName,
          jobRole: app.jobRole,
          status: app.status,
          appliedAt: app.appliedAt,
          // Milestone Tracking
          gdCount: user.groupDiscussions?.length || 0,
          aptitudeTests: user.aptitudeResults?.length || 0,
          latestResumeScore: user.resumeScorer?.length > 0 ? user.resumeScorer[user.resumeScorer.length - 1].score : 0
        });
      });
    });

    // Sorting by latest applications
    placementData.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({ success: true, data: placementData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch placement analytics" });
  }
};

// 2. Manual Status Update by Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { userId, applicationId, newStatus } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "applications._id": applicationId },
      { $set: { "applications.$.status": newStatus } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "Application not found" });

    await createLog(req, "UPDATE_APP_STATUS", updatedUser.email, `Admin changed status to ${newStatus} for ${applicationId}`);

    res.json({ success: true, message: `Status updated to ${newStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};