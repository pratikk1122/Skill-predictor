const Groq = require("groq-sdk");
const multer = require("multer");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib'); 
const jwt = require("jsonwebtoken"); // 🔥 ADDED: Token decode karne ke liye

const { extractTextFromFile } = require("../services/resumeFileParser");
const { analyzeResumeIntelligence } = require("../services/resumeIntelligence.service");

const Analytics = require("../models/Analytics");
// 🔥 NEW: Separate Collection Import
const ResumeScorer = require("../models/ResumeScorer"); 

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jobDescription || "";

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File required"
      });
    }

    const resumeText = await extractTextFromFile(file);

    const result = await analyzeResumeIntelligence({
      resumeText,
      jobDescription,
      aiClient: groq,
    });

    /* ================= ✅ BULLETPROOF DB SAVE LOGIC (REAL-TIME SYNC) ================= */
    let userId = req.user?.id || req.user?._id; // Agar middleware hai toh yahan se mil jayega
    let userEmail = req.user?.email;

    // Agar middleware nahi hai, toh hum khud Header se Token nikal kar decode karenge
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
        userId = decoded.id || decoded._id;
        userEmail = decoded.email;
      } catch (err) {
        console.log("⚠️ Token Decode Failed in Resume Controller:", err.message);
      }
    }

    if (userId) {
      try {
        // 1. 🔥 FIX: Using 'userId' instead of 'studentId' to match Analytics fetching
        await ResumeScorer.create({
          userId: userId, // Changed from studentId to userId for Real-time Dashboard sync
          email: userEmail || "Unknown",
          score: result?.overallScore || 0,
          filename: file.originalname,
          analyzedAt: new Date()
        });

        // 2. Analytics table update (Student Dashboard ke charts ke liye - Unchanged Workflow)
        await Analytics.findOneAndUpdate(
          { studentId: userId },
          { $set: { resumeScore: result?.overallScore || 0 } },
          { upsert: true, new: true }
        );
        
        console.log("✅ REAL-TIME SYNC: Added to ResumeScorer for User:", userId);
      } catch (err) {
        console.log("❌ DB Save Error:", err.message);
      }
    } else {
      console.log("⚠️ CAUTION: No User ID found. Dashboard count will not increase.");
    }
    /* ================================================================= */

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Analysis failed"
    });
  }
};

// ✅ Full Annotated PDF Download Logic (Unchanged)
const downloadAnnotatedResume = async (req, res) => {
  try {
    const { redlineErrors, fileBuffer, fileName } = req.body;

    if (!fileBuffer) {
      return res.status(400).send("Original file missing");
    }

    const existingPdfBytes = Buffer.from(fileBuffer, 'base64');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    page.drawText('SkillPredictor Intelligence: Annotated Review', {
      x: 50,
      y: height - 50,
      size: 20,
      font: helveticaBold,
      color: rgb(0, 0.5, 0.5)
    });

    let yOffset = height - 100;

    if (redlineErrors && redlineErrors.length > 0) {
      redlineErrors.forEach((err, index) => {
        if (yOffset < 100) return;

        page.drawText(`${index + 1}. DETECTED ERROR: "${err.original}"`, {
          x: 50,
          y: yOffset,
          size: 10,
          font: helveticaBold,
          color: rgb(0.8, 0, 0)
        });

        yOffset -= 15;

        page.drawText(`   SUGGESTED CORRECTION: ${err.correction}`, {
          x: 50,
          y: yOffset,
          size: 10,
          font: helvetica,
          color: rgb(0, 0.4, 0)
        });

        yOffset -= 30;
      });
    } else {
      page.drawText(
        'No critical redline errors found. Great job!',
        { x: 50, y: yOffset, size: 12 }
      );
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Annotated_${fileName}`
    );

    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error("PDF Annotation Error:", error);
    res.status(500).send("Failed to generate annotated PDF");
  }
};

module.exports = {
  analyzeResume,
  downloadAnnotatedResume,
  upload
};