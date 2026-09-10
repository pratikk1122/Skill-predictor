const express = require("express");
const router = express.Router();
const { startCompanyTest, submitCompanyTest } = require("../controllers/companyPrep.controller");

// ✅ Strict Requirement: Current workflow ke hisaab se agar middleware missing hai toh 
// controller khud token handle kar lega, isliye hum isse open ya protected dono rakh sakte hain.
// Lekin best practice ke liye agar aapke paas 'protect' middleware hai toh yahan laga sakte hain.

/* ===============================
    POST: START TEST
    URL: /api/company-prep/start
================================ */
router.post("/start", startCompanyTest);

/* ===============================
    POST: SUBMIT TEST
    URL: /api/company-prep/submit
================================ */
router.post("/submit", submitCompanyTest);

module.exports = router;