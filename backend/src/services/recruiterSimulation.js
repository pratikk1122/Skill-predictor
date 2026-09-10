// ============================================
// RECRUITER SIMULATION ENGINE
// ============================================

const simulateRecruiterScan = (resumeText = "") => {
  const first500Chars = resumeText.slice(0, 500).toLowerCase();

  let firstImpressionScore = 5;
  let strongOpening = false;
  let dropOffRisk = "Low";

  // Strong opening check
  if (
    first500Chars.includes("experience") ||
    first500Chars.includes("developer") ||
    first500Chars.includes("engineer")
  ) {
    firstImpressionScore += 2;
    strongOpening = true;
  }

  // Weak opening detection
  if (
    first500Chars.includes("objective") &&
    !first500Chars.includes("results") &&
    !first500Chars.includes("%")
  ) {
    firstImpressionScore -= 2;
    dropOffRisk = "Medium";
  }

  // Impact presence
  if (first500Chars.includes("%")) {
    firstImpressionScore += 1;
  }

  firstImpressionScore = Math.max(1, Math.min(firstImpressionScore, 10));

  return {
    firstImpressionScore,
    strongOpening,
    dropOffRisk,
    recruiterAttentionSummary:
      firstImpressionScore >= 7
        ? "Strong first impression. Recruiter likely to continue reading."
        : "Moderate first impression. Resume may need stronger opening impact."
  };
};

module.exports = { simulateRecruiterScan };
