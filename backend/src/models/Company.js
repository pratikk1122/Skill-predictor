const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // ✅ NEW: Course mapping (BCA / BSc / BTech)
    courses: {
      type: [String],
      default: []
    },

    // ⚠️ EXISTING FIELD (UNCHANGED)
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    /* ==============================================
       NEW PROFESSIONAL FIELDS (ADDED FOR SYNC)
    ============================================== */
    logo: {
      type: String,
      default: ""
    },

    website: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: ""
    },

    /* ==============================================
       ✅ NEW (Professional audit tracking)
       Used for activity logs (which admin updated)
    ============================================== */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
