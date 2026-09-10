const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* ================= MIDDLEWARES ================= */
app.use(cors());

// ✅ SAFE: Large limit preserved for Base64 resume data and PDF annotation
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ================= AUTH ROUTES ================= */
try {
  const authRoutes = require("./routes/auth.routes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes mounted");
} catch (err) {
  console.warn("⚠️ auth.routes not found");
}

/* ================= ADMIN ROUTES ================= */
try {
  const adminRoutes = require("./routes/admin.routes");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes mounted");
} catch (err) {
  console.warn("⚠️ admin.routes not found – admin APIs disabled");
}

/* ================= ADMIN INTERVIEW ROUTES ================= */
try {
  const adminInterviewRoutes = require("./routes/adminInterview.routes");
  app.use("/api/admin/interviews", adminInterviewRoutes);
  console.log("✅ Admin Interview routes mounted");
} catch (err) {
  console.warn("⚠️ adminInterview.routes not found – interview admin APIs disabled");
}

/* ================= APTITUDE ROUTES ================= */
try {
  const aptitudeRoutes = require("./routes/aptitude.routes");
  app.use("/api/aptitude", aptitudeRoutes);
  console.log("✅ Aptitude routes mounted successfully");
} catch (err) {
  console.warn("⚠️ aptitude.routes not found – aptitude APIs disabled");
}

/* ================= INTERVIEW ROUTES ================= */
try {
  const interviewRoutes = require("./routes/interview.routes");
  app.use("/api/interview", interviewRoutes);
  console.log("✅ Interview routes mounted successfully");
} catch (err) {
  console.warn("⚠️ interview.routes not found – interview APIs disabled");
}

/* ================= RESUME INTELLIGENCE ROUTES ================= */
try {
  const resumeIntelligenceRoutes = require("./routes/resumeIntelligence.routes");
  app.use("/api/resume-intelligence", resumeIntelligenceRoutes);
  console.log("✅ Resume Intelligence routes mounted successfully");
} catch (err) {
  console.warn("⚠️ resumeIntelligence.routes not found – resume APIs disabled");
}

/* ================= AI ROUTES (Existing) ================= */
try {
  const aiRoutes = require("./routes/aiRoutes");
  app.use("/api/ai", aiRoutes);
  console.log("✅ AI routes mounted successfully");
} catch (err) {
  console.warn("⚠️ aiRoutes.js not found – AI features disabled");
}

/* ================= COMPANY PREP ROUTES (NEW - BULLETPROOF) ================= */
// 🔥 Ye naya section Admin Dashboard ke "Company Modules" count ko handle karega
try {
  const companyPrepRoutes = require("./routes/companyPrep.routes");
  app.use("/api/company-prep", companyPrepRoutes);
  console.log("✅ Company Prep routes mounted successfully");
} catch (err) {
  console.warn("⚠️ companyPrep.routes.js not found – Company Prep APIs disabled");
}

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message || err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "File size too large. Please upload a smaller resume.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

module.exports = app;