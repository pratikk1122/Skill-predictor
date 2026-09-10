const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: { 
      type: String, 
      enum: ["admin"], 
      default: "admin" 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["query", "user_signup", "system_alert", "critical"], 
      default: "query" 
    },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    // 🔥 NEW: Path to navigate when clicked (e.g., /admin/helpdesk)
    link: { 
      type: String, 
      default: null 
    },
    // Reference to the user who triggered the notification (optional)
    relatedUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);