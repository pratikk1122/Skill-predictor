const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/* ================= REPORTS FOLDER CHECK ================= */

const reportsDir = path.join(process.cwd(), "reports");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/* ================= EXISTING GD REPORT FUNCTION ================= */

function generateGDReport(room, score) {

  try {

    const doc = new PDFDocument();

    const filePath = path.join(reportsDir, `gd_${Date.now()}.pdf`);

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text("Group Discussion Report", { align: "center" });

    doc.moveDown();

    doc.fontSize(14).text(`Topic: ${room.topic}`);

    doc.text(`Participants: ${room.participants.length}`);

    doc.moveDown();

    doc.fontSize(16).text("Scores");

    doc.text(`Communication: ${score.communication}`);
    doc.text(`Confidence: ${score.confidence}`);
    doc.text(`Argument Strength: ${score.argumentStrength}`);

    doc.moveDown();

    doc.fontSize(16).text("Transcript");

    room.messages.forEach(m => {
      doc.text(`${m.user}: ${m.message}`);
    });

    doc.end();

    return filePath;

  } catch (error) {

    console.error("GD Report generation failed:", error);
    return null;

  }

}

/* ================= NEW ANALYTICS REPORT FUNCTION ================= */

function generateFullAnalyticsReport(studentData) {

  try {

    const doc = new PDFDocument();

    const filePath = path.join(reportsDir, `analytics_${Date.now()}.pdf`);

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    /* ================= TITLE ================= */

    doc.fontSize(22).text("Student Analytics Report", { align: "center" });

    doc.moveDown();

    /* ================= STUDENT INFO ================= */

    doc.fontSize(14).text(`Student ID: ${studentData.studentId || "N/A"}`);

    doc.moveDown();

    /* ================= PERFORMANCE ================= */

    doc.fontSize(18).text("Performance Overview");

    doc.moveDown();

    doc.fontSize(12).text(`Resume Score: ${studentData.resumeScore || 0}`);
    doc.text(`Aptitude Score: ${studentData.aptitudeScore || 0}`);
    doc.text(`Interview Score: ${studentData.interviewScore || 0}`);
    doc.text(`GD Score: ${studentData.gdScore || 0}`);

    doc.moveDown();

    /* ================= SKILLS ================= */

    doc.fontSize(18).text("Skill Analysis");

    doc.moveDown();

    doc.fontSize(12).text(`Communication: ${studentData.communication || 0}`);
    doc.text(`Technical: ${studentData.technical || 0}`);
    doc.text(`Problem Solving: ${studentData.problemSolving || 0}`);
    doc.text(`Confidence: ${studentData.confidence || 0}`);
    doc.text(`Leadership: ${studentData.leadership || 0}`);

    doc.moveDown();

    /* ================= CAREER ================= */

    doc.fontSize(18).text("Career Prediction");

    doc.moveDown();

    doc.fontSize(12).text(
      `Recommended Career: ${studentData.predictedCareer || "Software Developer"}`
    );

    doc.moveDown();

    /* ================= AI INSIGHTS ================= */

    doc.fontSize(18).text("AI Insights");

    doc.moveDown();

    doc.fontSize(12).text(
      studentData.aiInsights ||
        "You have good potential. Continue practicing aptitude and interviews."
    );

    doc.moveDown();

    /* ================= IMPROVEMENT ================= */

    doc.fontSize(18).text("Improvement Suggestions");

    doc.moveDown();

    if (
      studentData.improvementSuggestions &&
      studentData.improvementSuggestions.length > 0
    ) {

      studentData.improvementSuggestions.forEach(s => {
        doc.text(`• ${s}`);
      });

    } else {

      doc.text("No major weaknesses detected.");

    }

    doc.moveDown();

    /* ================= ACTIVITY ================= */

    doc.fontSize(18).text("Activity Analytics");

    doc.moveDown();

    doc.fontSize(12).text(`Aptitude Tests: ${studentData.aptitudeTests || 0}`);
    doc.text(`Interview Mocks: ${studentData.interviewMocks || 0}`);
    doc.text(`GD Sessions: ${studentData.gdSessions || 0}`);
    doc.text(`Resume Uploads: ${studentData.resumeUploads || 0}`);

    doc.end();

    return filePath;

  } catch (error) {

    console.error("Analytics Report generation failed:", error);
    return null;

  }

}

/* ================= EXPORTS ================= */

module.exports = {
  generateGDReport,
  generateFullAnalyticsReport
};