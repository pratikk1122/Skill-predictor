const InterviewSession = require("../models/InterviewSession");
const Groq = require("groq-sdk");
const multer = require("multer");

const { analyzeResumeWithAI } = require("../services/resumeParser");
const {
  generateFirstQuestion,
  analyzeAnswerAndFollowUp,
} = require("../services/interviewAI");

const { extractTextFromFile } = require("../services/resumeFileParser");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   FILE UPLOAD CONFIG (Memory Storage)
===================================================== */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =====================================================
   START INTERVIEW (PERSONALIZED SYNC ENABLED)
===================================================== */
const startInterview = async (req, res) => {
  try {
    // 🔥 REQUIREMENT: Support both studentId and userId for cross-module sync
    const studentId = req.user?.id || req.user?._id;

    let resumeText = null;

    /* 🔥 SAFE DIFFICULTY VALIDATION */
    const allowedLevels = ["easy", "medium", "hard"];
    const difficulty = allowedLevels.includes(req.body?.difficulty)
      ? req.body.difficulty
      : "medium";

    /* ========= Resume Extraction ========= */
    if (req.file) {
      resumeText = await extractTextFromFile(req.file);
    }

    if (!resumeText && req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume file or resume text required",
      });
    }

    /* ========= Resume AI Analysis ========= */
    const analysis = await analyzeResumeWithAI(resumeText, groq);

    /* 🔥 Pass difficulty to AI */
    const firstQuestion = await generateFirstQuestion(
      analysis,
      difficulty
    );

    // 🔥 FIX: Saving both studentId and userId for real-time Analytics Engine mapping
    const session = await InterviewSession.create({
      studentId,
      userId: studentId, // Added userId to match Analytics Controller countDocuments filter
      resumeText,
      resumeAnalysis: analysis,
      difficulty,
      transcript: [{ question: firstQuestion }],
      totalQuestions: 5,
      status: "ongoing",
    });

    return res.json({
      success: true,
      sessionId: session._id,
      question: firstQuestion,
      difficulty,
      completed: false,
    });

  } catch (err) {
    console.error("Interview Start Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to start interview",
    });
  }
};

/* =====================================================
   SUBMIT ANSWER (REAL-TIME SCORING SYNC)
===================================================== */
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answer cannot be empty",
      });
    }

    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.status === "completed") {
      return res.json({
        success: true,
        completed: true,
        overallScore: session.overallScore,
        transcript: session.transcript,
      });
    }

    const lastIndex = session.transcript.length - 1;
    session.transcript[lastIndex].answer = answer;

    /* 🔥 Pass difficulty safely */
    const result = await analyzeAnswerAndFollowUp(
      session.resumeAnalysis,
      session.transcript,
      session.difficulty || "medium"
    );

    /* ========= NORMALIZE IMPROVEMENT ========= */
    let normalizedImprovement = [];

    if (Array.isArray(result.improvement)) {
      normalizedImprovement = result.improvement.map((item) => {
        if (typeof item === "string") {
          return { category: "General", description: item };
        }
        return {
          category: item.category || "General",
          description: item.description || "",
        };
      });
    } else if (typeof result.improvement === "string") {
      normalizedImprovement = [
        { category: "General", description: result.improvement },
      ];
    }

    session.transcript[lastIndex].feedback = {
      technical_score: result.technical_score || 0,
      communication_score: result.communication_score || 0,
      confidence_score: result.confidence_score || 0,
      improvement: normalizedImprovement,
    };

    const answeredCount = session.transcript.filter(
      (entry) => entry.answer
    ).length;

    /* =====================================================
       AUTO COMPLETE & FINAL SYNC
    ===================================================== */
    if (answeredCount >= session.totalQuestions) {
      let totalScore = 0;

      session.transcript.forEach((entry) => {
        if (entry.feedback) {
          totalScore +=
            (entry.feedback.technical_score || 0) +
            (entry.feedback.communication_score || 0) +
            (entry.feedback.confidence_score || 0);
        }
      });

      const maxPossible = session.totalQuestions * 30;
      const overallScore = Math.round((totalScore / maxPossible) * 100);

      session.overallScore = overallScore;
      session.status = "completed";
      
      // 🔥 Adding specific feedback field for Skill Radar in Analytics
      session.feedback = {
         communication: Math.round(result.communication_score / 2),
         technical: Math.round(result.technical_score / 2),
         confidence: Math.round(result.confidence_score / 2)
      };

      await session.save();

      console.log(`✅ INTERVIEW SYNCED: Score ${overallScore}% for User ${session.studentId}`);

      return res.json({
        success: true,
        completed: true,
        overallScore,
        transcript: session.transcript,
      });
    }

    /* =====================================================
       CONTINUE INTERVIEW
    ===================================================== */
    const nextQuestion =
      result.follow_up_question ||
      "Can you explain your answer in more detail?";

    session.transcript.push({
      question: nextQuestion,
    });

    await session.save();

    return res.json({
      success: true,
      feedback: session.transcript[lastIndex].feedback,
      nextQuestion,
      completed: false,
    });

  } catch (err) {
    console.error("Answer Submit Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process answer",
    });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  upload,
};