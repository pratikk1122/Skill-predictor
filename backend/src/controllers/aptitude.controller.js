// ============================================
// APTITUDE CONTROLLER (LIVE ADAPTIVE ENGINE)
// ============================================

const { generateSingleQuestion } = require("../services/aptitudeAI");
const AptitudeSession = require("../models/AptitudeSession");
const User = require("../models/User"); // 🔥 Requirement: Added for email fallback
const jwt = require("jsonwebtoken");

const TOTAL_QUESTIONS = 20;

// ===============================
// START TEST
// ===============================
const startAptitudeTest = async (req, res) => {
  try {
    const { category } = req.body || {};
    
    // ================= ✅ BULLETPROOF USER IDENTIFICATION =================
    let studentId = req.user?.id || req.user?._id;
    let studentEmail = req.user?.email;

    // Token decode fallback agar middleware se data nahi mila
    if (!studentId && req.headers.authorization?.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
        studentId = decoded.id || decoded._id;
        studentEmail = decoded.email;
      } catch (err) {
        console.log("⚠️ Token Decode Failed in Aptitude Start:", err.message);
      }
    }

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔥 Requirement: Fetch Email if still missing
    if (!studentEmail) {
      const user = await User.findById(studentId).select("email");
      studentEmail = user?.email;
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Check existing session
    let session = await AptitudeSession.findOne({
      studentId,
      status: "in-progress",
    });

    if (!session) {
      // 🔥 Requirement Update: studentEmail included in creation
      session = await AptitudeSession.create({
        studentId,
        studentEmail: studentEmail || "Unknown Student", 
        category,
        currentLevel: 2, // Start with Medium
        questionNumber: 0,
        totalQuestions: TOTAL_QUESTIONS,
        status: "in-progress",
        score: 0 // Explicitly setting initial score
      });
      console.log(`✅ APTITUDE STARTED: ${category} for ${studentEmail}`);
    }

    return res.status(200).json({
      success: true,
      sessionId: session._id,
      totalQuestions: TOTAL_QUESTIONS,
    });
  } catch (err) {
    console.error("❌ START ERROR:", err);
    return res.status(500).json({ success: false, message: "Start failed" });
  }
};

// ===============================
// GET NEXT QUESTION (LIVE)
// ===============================
const getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const studentId = req.user?.id || req.user?._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID required",
      });
    }

    const session = await AptitudeSession.findById(sessionId);

    if (!session || session.studentId.toString() !== studentId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid session",
      });
    }

    if (session.questionNumber >= TOTAL_QUESTIONS) {
      return res.status(200).json({
        success: true,
        finished: true,
      });
    }

    // Generate question based on currentLevel
    const aiResult = await generateSingleQuestion(
      session.category,
      session.currentLevel
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate question",
      });
    }

    const nextQuestionNumber = session.questionNumber + 1;

    return res.status(200).json({
      success: true,
      questionNumber: nextQuestionNumber,
      totalQuestions: TOTAL_QUESTIONS,
      question: {
        question: aiResult.question.question,
        options: aiResult.question.options,
        // 🔥 Score Sync Requirement: frontend needs correct answer for local evaluation
        correctAnswer: aiResult.question.correctAnswer, 
        explanation: aiResult.question.explanation
      },
    });
  } catch (error) {
    console.error("❌ NEXT QUESTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch next question",
    });
  }
};

// ===============================
// SUBMIT ANSWER (LIVE ADAPTIVE)
// ===============================
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionNumber, questionData, selectedOption } =
      req.body || {};
    const studentId = req.user?.id || req.user?._id;

    // 🔥 LIVE SYNC FIX: Ensuring session is fetched with latest updates
    const session = await AptitudeSession.findById(sessionId);

    if (!session || session.studentId.toString() !== studentId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid session",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Test already completed",
      });
    }

    const correctAnswer = questionData.correctAnswer;
    const explanation = questionData.explanation;

    const isCorrect = selectedOption === correctAnswer;

    // 🔥 LIVE SCORE SYNC: Update score immediately in memory
    if (isCorrect) {
      session.score += 1;
    }

    // Adaptive Difficulty Adjustment
    if (isCorrect) {
      session.currentLevel = Math.min(3, session.currentLevel + 1);
    } else {
      session.currentLevel = Math.max(1, session.currentLevel - 1);
    }

    // Save question attempt
    session.attemptedQuestions.push({
      questionNumber,
      question: questionData.question,
      options: questionData.options,
      correctAnswer,
      selectedOption,
      isCorrect,
      explanation,
      difficultyLevel: session.currentLevel,
    });

    session.questionNumber += 1;

    // If completed
    if (session.questionNumber >= TOTAL_QUESTIONS) {
      session.status = "completed";
      // 🔥 Requirement Update: Precise calculation for Dashboard sync
      session.percentage = Number(
        ((session.score / TOTAL_QUESTIONS) * 100).toFixed(2)
      );
      console.log(`✅ APTITUDE COMPLETED: ${session.studentEmail} scored ${session.percentage}%`);
    }

    // 🔥 SAVE SYNC: Mandatory for database persistence
    await session.save();

    return res.status(200).json({
      success: true,
      isCorrect,
      finished: session.status === "completed",
      score: session.score,
      currentLevel: session.currentLevel,
      questionNumber: session.questionNumber,
      totalQuestions: TOTAL_QUESTIONS,
    });
  } catch (error) {
    console.error("❌ SUBMIT ANSWER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Submission failed",
    });
  }
};

module.exports = {
  startAptitudeTest,
  getNextQuestion,
  submitAnswer,
};