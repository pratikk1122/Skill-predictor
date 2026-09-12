const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { generateOTP } = require("../utils/otp");

// ✅ EMAIL OTP UTILS
const { sendOtp, sendQueryResolvedEmail } = require("../utils/sendOtp"); 

// 🔥 NEW IMPORT: AI Response Service for Smart Helpdesk
const { generateAIResponse } = require("../services/aiResponse.service");

// 🔥 NEW IMPORT: Notification Model
const Notification = require("../models/Notification");

// 🔐 ADMIN CONFIG
const ADMIN_EMAILS = [
  "ajjangid660@gmail.com",
  "pratikkhode1122@gmail.com",
  "mastervedant05@gmail.com",
  "ovpatil1121@gmail.com",
  "sumitvyadav47@gmail.com"
];

const ADMIN_DEFAULT_PASSWORD = "774926";
const OTP_VALID_DAYS = 7;

/* =====================================================
    SEND OTP (LOGIN / SIGNUP) - OPTIMIZED NON-BLOCKING
===================================================== */
exports.sendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    email = email.trim().toLowerCase();
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({ email, isVerified: false });
      
      // 🔥 NOTIFICATION: New User Signup Alert for Admin
      await Notification.create({
        title: "New Student Registered",
        message: `A new user with email ${email} has started the registration process.`,
        type: "user_signup",
        priority: "low",
        link: "/admin/students"
      }).catch(err => console.error("Notification Error:", err));
    }

    if (user.otpSentAt && Date.now() - user.otpSentAt.getTime() < 30000) {
      return res.status(429).json({ message: "Please wait 30 seconds." });
    }

    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpSentAt = new Date();
    await user.save();

    const sendResult = await sendOtp(email, otp);

    if (!sendResult.success) {
      console.warn(`⚠️ Cloud SMTP delivery failed to ${email}: ${sendResult.error}`);
      if (ADMIN_EMAILS.includes(email)) {
        return res.json({
          message: "Admin security note: Email delivery delayed by network. Master admin code is: 774926"
        });
      }
      return res.json({
        message: `Email delivery delayed by network. Verification code: ${otp}`
      });
    }

    res.json({
      message: "Verification code sent to your email inbox."
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    VERIFY OTP (FOR SIGNUP & LOGIN)
===================================================== */
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp, password, firstName, surName, mobile, education } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Data missing" });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });

    const isAdminEmail = ADMIN_EMAILS.includes(email);
    const isMasterAdminOtp = isAdminEmail && otp === ADMIN_DEFAULT_PASSWORD;

    let isOtpMatch = false;
    if (user && user.otp) {
      if (user.otpExpires && user.otpExpires < Date.now() && !isMasterAdminOtp) {
        return res.status(400).json({ message: "OTP expired" });
      }
      isOtpMatch = await bcrypt.compare(otp, user.otp);
    }

    if (!isOtpMatch && !isMasterAdminOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.role = isAdminEmail ? "admin" : (user.role || "student");

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (firstName) user.firstName = firstName;
    if (surName) user.surName = surName;
    if (mobile) user.mobile = mobile;
    if (education) user.education = education;

    user.lastOtpVerifiedAt = new Date();
    user.lastLoginAt = new Date();
    user.forceOtpOnNextLogin = false; 
    user.isVerified = true;
    user.activeSessionId = uuidv4(); 
    user.otp = undefined;

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, sessionId: user.activeSessionId },
      process.env.JWT_SECRET || "skill_predictor_super_secret_key", { expiresIn: "30d" }
    );

    res.json({
      token, 
      role: user.role, 
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        surName: user.surName,
        name: user.firstName ? `${user.firstName} ${user.surName || ''}`.trim() : (user.name || "User"),
        email: user.email,
        education: user.education,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    LOGIN WITH PASSWORD (BYPASS LOGIC)
===================================================== */
exports.loginWithPassword = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing data" });

    email = email.trim().toLowerCase();
    let user = await User.findOne({ email });

    const isAdminEmail = ADMIN_EMAILS.includes(email);

    // If an official admin logs in and user document doesn't exist yet, initialize it
    if (isAdminEmail && !user) {
      user = await User.create({
        email,
        role: "admin",
        isVerified: true,
        password: await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10)
      });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Validate credentials: check default admin master password or user's hashed password
    let isMatch = false;
    if (isAdminEmail && password === ADMIN_DEFAULT_PASSWORD) {
      isMatch = true;
    } else if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate 6-digit OTP for login email verification
    const otp = generateOTP();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpSentAt = new Date();
    if (isAdminEmail) user.role = "admin";
    await user.save();

    const sendResult = await sendOtp(email, otp);

    if (sendResult.success) {
      return res.json({ 
        requireOtp: true, 
        message: "A 6-digit verification code has been sent to your email inbox.",
        user: {
          _id: user._id,
          id: user._id,
          firstName: user.firstName,
          surName: user.surName,
          email: user.email,
          role: user.role
        }
      });
    }

    // 🛡️ FAIL-SAFE: If Render cloud host blocked outbound SMTP traffic:
    console.warn(`⚠️ SMTP delivery failed on cloud server for ${email}: ${sendResult.error}`);

    if (isAdminEmail) {
      // Direct login for verified Admin - never lock the administrator out!
      user.lastLoginAt = new Date();
      user.lastOtpVerifiedAt = new Date();
      user.isVerified = true;
      user.activeSessionId = uuidv4();
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: "admin", sessionId: user.activeSessionId },
        process.env.JWT_SECRET || "skill_predictor_super_secret_key",
        { expiresIn: "30d" }
      );

      return res.json({
        token,
        role: "admin",
        user: {
          _id: user._id,
          id: user._id,
          firstName: user.firstName || "Admin",
          surName: user.surName || "",
          name: user.firstName ? `${user.firstName} ${user.surName || ''}`.trim() : "Admin",
          email: user.email,
          role: "admin"
        },
        message: "Admin authenticated successfully."
      });
    }

    // For students: Return requireOtp with the code in message so they can verify without getting blocked
    return res.json({ 
      requireOtp: true, 
      message: `Email gateway delayed by network. Verification code: ${otp}`,
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        surName: user.surName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    LOGOUT
===================================================== */
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.activeSessionId = null; 
      await user.save();
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    FORGOT PASSWORD - STEP 1 (Strict Email OTP)
===================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      if (!ADMIN_EMAILS.includes(email)) {
        return res.status(404).json({ message: "Email not authorized" });
      }

      user = await User.create({
        email,
        role: "admin",
        isVerified: false,
        isFirstLogin: true
      });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = await bcrypt.hash(otp, 10);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const sendResult = await sendOtp(email, otp);

    if (!sendResult.success) {
      return res.status(500).json({ 
        message: "Failed to send reset code to your email. Please try again." 
      });
    }

    res.json({
      message: "Reset code sent to your email inbox."
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR 👉", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    VERIFY RESET OTP - STEP 2
===================================================== */
exports.verifyResetOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !user.resetPasswordOtp) return res.status(400).json({ message: "Invalid request" });
    if (user.resetPasswordExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ otpVerified: true, message: "OTP verified." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    RESET PASSWORD - STEP 3
===================================================== */
exports.resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user || !user.resetPasswordOtp) return res.status(400).json({ message: "Invalid request" });
    if (user.resetPasswordExpires < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    user.lastOtpVerifiedAt = null; 
    user.forceOtpOnNextLogin = true; 

    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* =====================================================
    CHANGE PASSWORD
===================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is wrong" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.forceOtpOnNextLogin = true; 

    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
    🔥 SMART HELPDESK: SUBMIT QUERY + AUTO MAIL (FIXED COUNT)
===================================================== */
exports.submitQuery = async (req, res) => {
  try {
    let { name, email, message } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) return res.status(404).json({ message: "Signup required" });

    const aiResponse = await generateAIResponse(`Provide a professional English resolution: ${message}. (No login required)`);
    
    let queryStatus = "Pending";
    let aiReply = null;
    let resolvedByFlag = null;

    if (aiResponse && !aiResponse.includes("Our AI is taking a quick break")) {
        queryStatus = "Resolved";
        aiReply = aiResponse;
        resolvedByFlag = "AI"; 

        sendQueryResolvedEmail(user.email, message, aiReply).catch(err => 
            console.error("Auto-Resolution Mail Error:", err)
        );
    }

    user.queries.push({ 
        studentName: name, 
        queryContent: message, 
        reply: aiReply, 
        status: queryStatus,
        resolvedBy: resolvedByFlag, 
        createdAt: new Date() 
    });

    await user.save();

    // 🔥 NOTIFICATION: New Inquiry Alert for Admin
    await Notification.create({
      title: "New Helpdesk Inquiry",
      message: `${name} (${email}) has raised a query: "${message.substring(0, 30)}..."`,
      type: "query",
      priority: queryStatus === "Pending" ? "high" : "low",
      link: "/admin/helpdesk",
      relatedUser: user._id
    }).catch(err => console.error("Notification Error:", err));

    res.json({ 
        success: true, 
        message: queryStatus === "Resolved" ? "Query Resolved & English Email Sent" : "Submitted to Helpdesk",
        autoResolved: queryStatus === "Resolved"
    });

  } catch (err) { 
    console.error("SUBMIT QUERY ERROR 👉", err);
    res.status(500).json({ message: "Error processing query" }); 
  }
};

/* =====================================================
    PUBLIC STATS (LANDING PAGE)
===================================================== */
const Company = require("../models/Company");

exports.getPublicStats = async (req, res) => {
  try {
    const studentsJoined = await User.countDocuments({ role: "student" });

    const companies = await Company.countDocuments({
      status: "Active"
    });

    res.json({
      success: true,
      stats: {
        studentsJoined,
        mockInterviews: 0,
        questions: 10000,
        companies,
        support: "24/7"
      }
    });
  } catch (err) {
    console.error("PUBLIC STATS ERROR 👉", err);
    res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
};