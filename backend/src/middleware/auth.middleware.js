const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin session validation only for admin
    if (user.role === "admin") {
      if (
        !user.activeSessionId ||
        decoded.sessionId !== user.activeSessionId
      ) {
        return res.status(401).json({
          success: false,
          message: "Admin session expired. Please login again.",
        });
      }
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: user.activeSessionId || null,
    };

    next();
  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ✅ DEFAULT EXPORT (IMPORTANT)
module.exports = authMiddleware;
