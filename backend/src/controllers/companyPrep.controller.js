const CompanyPrep = require("../models/CompanyPrep");
const User = require("../models/User"); // 🔥 Requirement: Added to fetch email if missing
const jwt = require("jsonwebtoken");

/**
 * @desc    Start a company specific test/module and record it for Admin Dashboard
 * @route   POST /api/company-prep/start
 * @access  Private (Student)
 */
exports.startCompanyTest = async (req, res) => {
  try {
    const { companyName, moduleName } = req.body;
    
    // ================= ✅ BULLETPROOF USER IDENTIFICATION =================
    let userId = req.user?.id || req.user?._id;
    let userEmail = req.user?.email; 

    // 1. Agar middleware se data nahi mila, toh Token decode karke ID aur Email nikalenge
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
        userId = decoded.id || decoded._id;
        userEmail = decoded.email; 
      } catch (err) {
        console.log("⚠️ Token Decode Failed in CompanyPrep Controller:", err.message);
      }
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User identification failed. Dashboard count will not update." 
      });
    }

    // 2. 🔥 EXTRA SAFETY: Agar email abhi bhi nahi mili, toh User model se fetch karenge
    if (!userEmail) {
      const user = await User.findById(userId).select("email");
      userEmail = user?.email;
    }

    // ================= ✅ SAVE WITH STUDENT EMAIL & COMPANY =================
    const newAttempt = await CompanyPrep.create({
      studentId: userId,
      studentEmail: userEmail || "Unknown Student", // 🔥 Requirement: Guaranteed Email Record
      companyName: companyName || "General Placement",
      moduleName: moduleName || "Placement Module",
      status: "started",
      score: 0, 
      accessedAt: new Date()
    });

    console.log(`✅ SUCCESS: ${companyName} session started by ${userEmail}`);

    return res.status(201).json({
      success: true,
      message: "Test activity recorded successfully",
      attemptId: newAttempt._id // 🔥 Frontend isse submit ke waqt score update ke liye use karega
    });

  } catch (error) {
    console.error("❌ START COMPANY TEST ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to record company test activity" 
    });
  }
};

/**
 * @desc    Submit REAL score for the company test
 * @route   POST /api/company-prep/submit
 */
exports.submitCompanyTest = async (req, res) => {
  try {
    const { attemptId, score } = req.body;

    if (!attemptId) {
      return res.status(400).json({ 
        success: false, 
        message: "Attempt ID is required to update real score" 
      });
    }

    // 🔥 REQUIREMENT UPDATE: Bulletproof Score Parsing & Status Sync
    // Humne parseFloat aur Math.round use kiya hai taaki decimal points collection kharab na karein
    const finalScore = Math.round(parseFloat(score)) || 0;

    const updated = await CompanyPrep.findByIdAndUpdate(
      attemptId,
      { 
        score: finalScore, 
        status: "completed" 
      },
      { new: true, runValidators: true } // new: true ensures latest data is returned
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    console.log(`✅ REAL SCORE UPDATED: ${updated.studentEmail} scored ${finalScore} in ${updated.companyName}`);

    res.json({
      success: true,
      message: "Real score updated in collection successfully",
      data: updated
    });
  } catch (error) {
    console.error("❌ SUBMIT SCORE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit real test score" 
    });
  }
};