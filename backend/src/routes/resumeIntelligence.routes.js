const express = require("express");
const router = express.Router();
const { analyzeResume, downloadAnnotatedResume, upload } = require("../controllers/resumeIntelligence.controller");

// Route for analysis
router.post("/analyze", upload.single("resume"), analyzeResume);

// Route for annotated download
router.post("/download-annotated", downloadAnnotatedResume);

module.exports = router;