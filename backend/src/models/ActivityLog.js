const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({

  // Kis Admin ne action liya (ID and Email)
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  adminEmail: { 
    type: String, 
    required: true 
  },
  
  // ✅ NEW: Admin ka naam store karne ke liye
  adminName: { 
    type: String, 
    default: "Admin" 
  },

  /* =========================================
     ✅ NEW: LOG TYPE (Student / Company)
     Professional filtering support
  ========================================= */
  type: {
    type: String,
    enum: ["STUDENT", "COMPANY"],
    default: "STUDENT"
  },

  // Kya action perform kiya gaya (e.g., ADD_COMPANY, DELETE_COMPANY, BLOCK_STUDENT)
  action: { 
    type: String, 
    required: true 
  }, 

  // Kis student par action liya gaya (Optional for company tasks)
  targetEmail: { 
    type: String, 
    required: false
  },

  // Additional detail (e.g., "Added new partner: Google")
  details: { 
    type: String 
  },

  // 🔐 REQUIREMENT: Undeletable logs ke liye timestamp
  timestamp: { 
    type: Date, 
    default: Date.now,
    immutable: true
  }

}, { 
  timestamps: false,
  versionKey: false 
});


/* 📌 SECURITY NOTE:
  Logs are permanent (audit trail).
  Delete routes intentionally not exposed.
*/


module.exports = mongoose.model("ActivityLog", activityLogSchema);
