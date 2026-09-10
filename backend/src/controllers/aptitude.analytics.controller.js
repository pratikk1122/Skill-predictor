// ============================================
// APTITUDE ANALYTICS CONTROLLER (ADVANCED)
// ============================================

const AptitudeSession = require("../models/AptitudeSession");
const { generatePerformanceInsight } = require("../services/analyticsEngine");

// ===============================
// HISTORY API
// ===============================
const getAptitudeHistory = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    const sessions = await AptitudeSession.find({
      studentId,
      status: "completed",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalTests: sessions.length,
      history: sessions.map((s) => ({
        sessionId: s._id,
        category: s.category,
        difficulty: s.difficulty,
        score: s.score,
        percentage: s.percentage,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("HISTORY ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

// ===============================
// ANALYTICS API
// ===============================
const getAptitudeAnalytics = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    const sessions = await AptitudeSession.find({
      studentId,
      status: "completed",
    });

    if (!sessions.length) {
      return res.status(200).json({
        success: true,
        message: "No completed tests found",
      });
    }

    const totalTests = sessions.length;
    const scores = sessions.map((s) => s.percentage);

    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Standard deviation for consistency
    const variance =
      scores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      scores.length;

    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - stdDev).toFixed(2);

    // Category-wise performance
    const categoryStats = {};
    const difficultyStats = {};

    sessions.forEach((s) => {
      if (!categoryStats[s.category]) {
        categoryStats[s.category] = { total: 0, count: 0 };
      }

      categoryStats[s.category].total += s.percentage;
      categoryStats[s.category].count++;

      if (!difficultyStats[s.difficulty]) {
        difficultyStats[s.difficulty] = { total: 0, count: 0 };
      }

      difficultyStats[s.difficulty].total += s.percentage;
      difficultyStats[s.difficulty].count++;
    });

    Object.keys(categoryStats).forEach((cat) => {
      categoryStats[cat].average = (
        categoryStats[cat].total / categoryStats[cat].count
      ).toFixed(2);
    });

    Object.keys(difficultyStats).forEach((diff) => {
      difficultyStats[diff].average = (
        difficultyStats[diff].total / difficultyStats[diff].count
      ).toFixed(2);
    });

    // Placement Readiness Score
    const hardAccuracy =
      difficultyStats["hard"]?.average || avg;

    const readinessScore = (
      avg * 0.5 +
      consistency * 0.2 +
      hardAccuracy * 0.3
    ).toFixed(2);

    // AI Insight
    const insight = await generatePerformanceInsight({
      avg,
      consistency,
      readinessScore,
      categoryStats,
      difficultyStats,
    });

    return res.status(200).json({
      success: true,
      overview: {
        totalTests,
        averageScore: avg.toFixed(2),
        highest,
        lowest,
        consistency,
        readinessScore,
      },
      categoryStats,
      difficultyStats,
      trend: scores.slice(-5),
      insight,
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  getAptitudeHistory,
  getAptitudeAnalytics,
};
