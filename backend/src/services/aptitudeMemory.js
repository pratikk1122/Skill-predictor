// ======================================
// APTITUDE MEMORY SERVICE (NO DB)
// ======================================

const crypto = require("crypto");

// 🔐 Student-wise used questions
// {
//   studentId: Set(questionHash)
// }
const studentQuestionHistory = {};

// 🌍 Global used questions (to avoid cross-student repeat)
const globalQuestionHistory = new Set();

// ⏱️ Cleanup configuration
const STUDENT_MEMORY_TTL = 24 * 60 * 60 * 1000; // 24 hours

// 🧠 Internal cleanup tracker
const studentCleanupTimers = {};

/* =====================================================
   🔑 Generate hash for a question
===================================================== */
const generateQuestionHash = (questionText) => {
  return crypto
    .createHash("sha256")
    .update(questionText.trim().toLowerCase())
    .digest("hex");
};

/* =====================================================
   ✅ Check & Register Question (No Repeat)
===================================================== */
const registerQuestionIfUnique = (studentId, questionText) => {
  const hash = generateQuestionHash(questionText);

  // Init student memory if not exists
  if (!studentQuestionHistory[studentId]) {
    studentQuestionHistory[studentId] = new Set();

    // ⏱️ Auto cleanup after TTL
    studentCleanupTimers[studentId] = setTimeout(() => {
      delete studentQuestionHistory[studentId];
      delete studentCleanupTimers[studentId];
    }, STUDENT_MEMORY_TTL);
  }

  // ❌ Already used by this student
  if (studentQuestionHistory[studentId].has(hash)) {
    return false;
  }

  // ❌ Already used globally
  if (globalQuestionHistory.has(hash)) {
    return false;
  }

  // ✅ Register question
  studentQuestionHistory[studentId].add(hash);
  globalQuestionHistory.add(hash);

  return true;
};

/* =====================================================
   🧹 Manual Cleanup (Optional)
===================================================== */
const clearStudentMemory = (studentId) => {
  if (studentQuestionHistory[studentId]) {
    delete studentQuestionHistory[studentId];
  }

  if (studentCleanupTimers[studentId]) {
    clearTimeout(studentCleanupTimers[studentId]);
    delete studentCleanupTimers[studentId];
  }
};

module.exports = {
  generateQuestionHash,
  registerQuestionIfUnique,
  clearStudentMemory
};
