/* ================= IMPORTS ================= */
const Analytics = require("../models/Analytics");
const User = require("../models/User"); 
const AptitudeSession = require("../models/AptitudeSession");
const gdRoom = require("../models/gdRoom.model"); 
const InterviewSession = require("../models/InterviewSession");
const ResumeScorer = require("../models/ResumeScorer"); 
const CompanyPrep = require("../models/CompanyPrep");
const mongoose = require("mongoose"); // 🔥 FIX: Required for ObjectId casting

/* ================= SAFE IMPORT FOR REPORT GENERATOR ================= */
let generateFullAnalyticsReport;

try {
  const reportUtils = require("../utils/reportgenerator");
  generateFullAnalyticsReport = reportUtils.generateFullAnalyticsReport;
} catch (err) {
  console.log("Report generator not loaded:", err.message);
}

/* ================= FS ================= */
const fs = require("fs");

/* ================= PERFORMANCE OVERVIEW (PERSONALIZED & REAL-TIME) ================= */
exports.getPerformanceOverview = async (req, res) => {
  try {
    // 🔥 REQUIREMENT FIX: Ensuring ID is converted to MongoDB ObjectId
    const rawId = req.user?.id || req.user?._id || req.params.studentId;
    if (!mongoose.Types.ObjectId.isValid(rawId)) return res.status(400).json({ error: "Invalid Student ID" });
    const studentId = new mongoose.Types.ObjectId(rawId);
    
    // 🔥 REAL-TIME AGGREGATION: Fetching latest scores for THIS student only
    const [aptitude, company, interview, resumeData] = await Promise.all([
      AptitudeSession.findOne({ studentId }).sort({ createdAt: -1 }),
      CompanyPrep.findOne({ studentId }).sort({ createdAt: -1 }),
      InterviewSession.findOne({ studentId }).sort({ createdAt: -1 }), 
      ResumeScorer.findOne({ userId: studentId }).sort({ createdAt: -1 })
    ]);

    res.json({
      resume: resumeData?.score || 0,
      aptitude: aptitude?.percentage || 0,
      interview: interview?.overallScore || interview?.score || 0,
      gd: 0 
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch performance overview"
    });
  }
};

/* ================= SKILL RADAR (PERSONALIZED) ================= */
exports.getSkillRadar = async (req, res) => {
  try {
    const rawId = req.user?.id || req.user?._id || req.params.studentId;
    const studentId = new mongoose.Types.ObjectId(rawId);
    
    // Aggregating real skill data from THIS student's sessions
    const interview = await InterviewSession.findOne({ studentId }).sort({ createdAt: -1 });
    const aptitude = await AptitudeSession.findOne({ studentId }).sort({ createdAt: -1 });

    res.json([
      { skill: "Communication", score: interview?.feedback?.communication || 5 },
      { skill: "Technical", score: interview?.feedback?.technical || 5 },
      { skill: "Problem Solving", score: aptitude?.percentage ? Math.round(aptitude.percentage / 10) : 5 },
      { skill: "Confidence", score: interview?.feedback?.confidence || 5 },
      { skill: "Leadership", score: 5 } 
    ]);
  } catch (err) {
    res.status(500).json({
      error: "Failed to load skill radar"
    });
  }
};

/* ================= CAREER PREDICTION ================= */
exports.getCareerPrediction = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id || req.params.studentId;
    const data = await Analytics.findOne({ studentId });

    if (!data) {
      return res.json({
        recommendedCareer: "Software Developer",
        alternatives: ["Frontend Developer", "QA Engineer"]
      });
    }

    let career = "Software Developer";
    if (data.technical > 7) career = "Backend Developer";
    if (data.communication > 8) career = "Business Analyst";

    res.json({
      recommendedCareer: career,
      alternatives: [
        "Frontend Developer",
        "Data Analyst",
        "QA Engineer"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "Career prediction failed"
    });
  }
};

/* ================= WEAKNESS DETECTION (PERSONALIZED) ================= */
exports.detectWeakness = async (req, res) => {
  try {
    const rawId = req.user?.id || req.user?._id || req.params.studentId;
    const studentId = new mongoose.Types.ObjectId(rawId);
    const weaknesses = [];

    const aptitude = await AptitudeSession.findOne({ studentId }).sort({ createdAt: -1 });
    const interview = await InterviewSession.findOne({ studentId }).sort({ createdAt: -1 });

    if (interview && (interview.overallScore < 50 || interview.score < 50)) weaknesses.push("Interview Confidence");
    if (aptitude && aptitude.percentage < 50) weaknesses.push("Aptitude Speed");
    
    if (weaknesses.length === 0) weaknesses.push("Keep practicing to maintain consistency");

    res.json({ weaknesses });
  } catch (err) {
    res.status(500).json({
      error: "Weakness detection failed"
    });
  }
};

/* ================= AI STUDY PLAN ================= */
exports.generateStudyPlan = async (req, res) => {
  try {
    const plan = [
      { week: 1, focus: "Improve aptitude basics" },
      { week: 2, focus: "Practice coding problems" },
      { week: 3, focus: "Mock interviews" },
      { week: 4, focus: "Group discussion practice" }
    ];

    res.json(plan);
  } catch (err) {
    res.status(500).json({
      error: "Failed to generate study plan"
    });
  }
};

/* ================= ACTIVITY ANALYTICS (PERSONALIZED COUNTS) ================= */
exports.getActivityAnalytics = async (req, res) => {
  try {
    // 🔥 IDENTITY PROTECTOR: Student ID extraction
    const rawId = req.user?.id || req.user?._id || req.params.studentId;
    const studentId = new mongoose.Types.ObjectId(rawId);

    // 🔥 REQUIREMENT FIX: Casting IDs for strict DB matching
    const [aptCount, intCount, companyCount, resumeCount] = await Promise.all([
      AptitudeSession.countDocuments({ studentId }),
      InterviewSession.countDocuments({ studentId }),
      CompanyPrep.countDocuments({ studentId }),
      ResumeScorer.countDocuments({ userId: studentId }) 
    ]);

    res.json({
      resumeBuilder: resumeCount > 0,
      resumeScans: resumeCount,
      aptitudeTests: aptCount,
      interviewMocks: intCount,
      companyPrepCount: companyCount,
      gdSessions: 0 
    });
  } catch (err) {
    res.status(500).json({
      error: "Activity analytics error"
    });
  }
};

/* ================= RESUME ANALYTICS ================= */
exports.getResumeAnalytics = async (req, res) => {
  try {
    res.json({
      resumeScore: 72,
      suggestions: [
        "Add more technical skills",
        "Improve project descriptions",
        "Add GitHub profile"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "Resume analytics failed"
    });
  }
};

/* ================= INTERVIEW ANALYTICS ================= */
exports.getInterviewAnalytics = async (req, res) => {
  try {
    res.json({
      confidenceScore: 65,
      feedback: [
        "Improve eye contact",
        "Structure answers clearly",
        "Reduce filler words"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "Interview analytics failed"
    });
  }
};

/* ================= APTITUDE ANALYTICS (REAL-TIME) ================= */
exports.getAptitudeAnalytics = async (req, res) => {
  try {
    const rawId = req.user?.id || req.user?._id || req.params.studentId;
    const studentId = new mongoose.Types.ObjectId(rawId);
    const session = await AptitudeSession.findOne({ studentId }).sort({ createdAt: -1 });

    res.json({
      totalQuestions: session?.totalQuestions || 20,
      correct: session?.score || 0,
      accuracy: session?.percentage ? `${session.percentage}%` : "0%"
    });
  } catch (err) {
    res.status(500).json({
      error: "Aptitude analytics failed"
    });
  }
};

/* ================= COMPANY APTITUDE ================= */
exports.getCompanyAptitude = async (req, res) => {
  try {
    res.json({
      companies: [
        "TCS Mock Test",
        "Infosys Mock Test",
        "Wipro Mock Test",
        "Accenture Mock Test"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "Company aptitude analytics failed"
    });
  }
};

/* ================= GROUP DISCUSSION ================= */
exports.getGDAnalytics = async (req, res) => {
  try {
    res.json({
      participationScore: 75,
      feedback: [
        "Good communication",
        "Needs stronger arguments",
        "Encourage more participation"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "GD analytics failed"
    });
  }
};

/* ================= AI INSIGHTS ================= */
exports.getAIInsights = async (req, res) => {
  try {
    res.json({
      insight: "You have strong technical skills but need improvement in communication and aptitude speed."
    });
  } catch (err) {
    res.status(500).json({
      error: "AI insights generation failed"
    });
  }
};

/* ================= IMPROVEMENT SUGGESTIONS ================= */
exports.getImprovementSuggestions = async (req, res) => {
  try {
    res.json({
      suggestions: [
        "Practice aptitude daily",
        "Improve resume formatting",
        "Attend mock interviews",
        "Participate in group discussions"
      ]
    });
  } catch (err) {
    res.status(500).json({
      error: "Improvement suggestions failed"
    });
  }
};

/* ================= DOWNLOAD REPORT ================= */
exports.downloadFullReport = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const data = await Analytics.findOne({ studentId });

    if (!data) {
      return res.status(404).json({
        error: "Student analytics not found"
      });
    }

    if (!generateFullAnalyticsReport) {
      return res.status(500).json({
        error: "Report generator not available"
      });
    }

    const filePath = generateFullAnalyticsReport(data);

    res.download(filePath, "student_analytics_report.pdf", (err) => {
      if (err) console.log("Download error", err);

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    });
  } catch (err) {
    res.status(500).json({
      error: "Report generation failed"
    });
  }
};

/* ================= ADMIN DASHBOARD ANALYTICS (STAYS GLOBAL) ================= */
exports.getAdminSummary = async (req, res) => {
  try {
    let totalResumes = 0;
    try {
      totalResumes = await ResumeScorer.countDocuments();
    } catch(e) { console.log("ResumeScorer model missing or empty"); }

    const totalAptitude = await AptitudeSession.countDocuments();
    const totalGD = await gdRoom.countDocuments();
    const totalInterviews = await InterviewSession.countDocuments();

    let totalCompanyPrep = 0;
    try {
      totalCompanyPrep = await CompanyPrep.countDocuments();
    } catch(e) { console.log("CompanyPrep model missing or empty"); }

    const interviews = await InterviewSession.find();

    let avgScore = 0;
    let weakStudents = 0;
    let strongStudents = 0;

    if (interviews.length > 0) {
      const totalScore = interviews.reduce((acc, i) => acc + (i.overallScore || i.score || 0), 0);
      avgScore = Math.round(totalScore / interviews.length);

      interviews.forEach(i => {
        const s = i.overallScore || i.score || 0;
        if (s < 50) weakStudents++;
        if (s >= 80) strongStudents++;
      });
    }

    res.json({
      data: {
        totalInterviews,
        averageScore: avgScore,
        weakStudents,
        strongStudents,
        totalResumes,
        totalAptitude,
        totalGD,
        totalCompanyPrep
      }
    });

  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Failed to load admin analytics" });
  }
};