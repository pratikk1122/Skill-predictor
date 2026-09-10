const InterviewSession = require("../models/InterviewSession");
const User = require("../models/User");

/* =====================================================
    GET STUDENT-WISE INTERVIEW SUMMARY (GROUPED)
===================================================== */
const getInterviewSummary = async (req, res) => {
  try {
    const summary = await InterviewSession.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$studentId",
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: "$overallScore" },
          latestScore: { $first: "$overallScore" },
          latestDate: { $first: "$createdAt" },
        },
      },
    ]);

    const formatted = await Promise.all(
      summary.map(async (item) => {
        const student = await User.findById(item._id).select(
          "email firstName surName"
        );

        return {
          studentId: item._id,
          name: `${student?.firstName || ""} ${student?.surName || ""}`.trim(),
          email: student?.email || "",
          totalInterviews: item.totalInterviews || 0,
          avgScore: Math.round(item.avgScore || 0),
          latestScore: item.latestScore || 0,
          latestDate: item.latestDate || null,
        };
      })
    );

    return res.json({
      success: true,
      data: formatted || [],
    });
  } catch (err) {
    console.error("Admin Interview Summary Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview summary",
    });
  }
};

/* =====================================================
    GET ALL INTERVIEWS OF A STUDENT
===================================================== */
const getStudentInterviews = async (req, res) => {
  try {
    const { studentId } = req.params;

    const interviews = await InterviewSession.find({ studentId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: interviews || [],
    });
  } catch (err) {
    console.error("Admin Interview Detail Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student interviews",
    });
  }
};

/* =====================================================
    DELETE INTERVIEW
===================================================== */
const deleteInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await InterviewSession.findByIdAndDelete(sessionId);

    return res.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (err) {
    console.error("Delete Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete interview",
    });
  }
};

/* =====================================================
    RESET INTERVIEW
===================================================== */
const resetInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.transcript = [];
    session.overallScore = 0;
    session.status = "ongoing";

    await session.save();

    return res.json({
      success: true,
      message: "Interview reset successfully",
    });
  } catch (err) {
    console.error("Reset Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reset interview",
    });
  }
};

/* =====================================================
    🔥 ADMIN FULL ANALYTICS SUMMARY (FIXED & SYNCED)
    Fetches REAL data from the updated User Model fields.
===================================================== */
const getInterviewAnalytics = async (req, res) => {
  try {
    // 1. Core Interview Stats from InterviewSession Collection
    const interviewResult = await InterviewSession.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          averageScore: { $avg: "$overallScore" },
          weakStudents: { $sum: { $cond: [{ $lt: ["$overallScore", 40] }, 1, 0] } },
          strongStudents: { $sum: { $cond: [{ $gt: ["$overallScore", 70] }, 1, 0] } },
        },
      },
    ]);

    const interviewData = interviewResult[0] || {};

    // 2. Real-time Aggregation for Resume, Aptitude, GD & Company Modules
    // Using $size on User arrays to get exact activity counts
    const moduleStats = await User.aggregate([
      { $match: { role: "student" } },
      {
        $group: {
          _id: null,
          totalResumes: { $sum: { $size: { $ifNull: ["$resumeScorer", []] } } },
          totalAptitude: { $sum: { $size: { $ifNull: ["$aptitudeResults", []] } } },
          totalGD: { $sum: { $size: { $ifNull: ["$groupDiscussions", []] } } },
          totalCompanyPrep: { $sum: { $size: { $ifNull: ["$companyPrep", []] } } }
        }
      }
    ]);

    const data = moduleStats[0] || {};

    return res.json({
      success: true,
      data: {
        // Mock Interview Stats
        totalInterviews: interviewData.totalInterviews || 0,
        averageScore: Math.round(interviewData.averageScore || 0),
        weakStudents: interviewData.weakStudents || 0,
        strongStudents: interviewData.strongStudents || 0,

        // New Integrated Module Stats (REAL DATA FROM DB)
        totalResumes: data.totalResumes || 0,
        totalAptitude: data.totalAptitude || 0,
        totalGD: data.totalGD || 0,
        totalCompanyPrep: data.totalCompanyPrep || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard Analytics Sync Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to sync dashboard metrics",
    });
  }
};

module.exports = {
  getInterviewSummary,
  getStudentInterviews,
  deleteInterview,
  resetInterview,
  getInterviewAnalytics,
};