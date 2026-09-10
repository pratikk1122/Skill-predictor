const mongoose = require("mongoose");
const aiGDSchema = new mongoose.Schema({
  studentEmail: String,
  studentName: String,
  roomId: String,
  topic: String,
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model("AiGD", aiGDSchema);