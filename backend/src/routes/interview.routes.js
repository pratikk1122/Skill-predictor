const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  upload, // 🔥 multer upload imported from controller
} = require("../controllers/interview.controller");

const authMiddleware = require("../middleware/auth.middleware");

/* =====================================================
   START INTERVIEW
   Supports:
   - PDF / DOCX file upload (field name: resume)
   - resumeText (fallback safe)
   - difficulty (easy | medium | hard)
===================================================== */
router.post(
  "/start",
  authMiddleware,
  upload.single("resume"), // 🔥 file upload middleware
  startInterview
);

/* =====================================================
   SUBMIT ANSWER
   Supports:
   - sessionId
   - answer
===================================================== */
router.post(
  "/answer",
  authMiddleware,
  submitAnswer
);

module.exports = router;
