/**
 * Helper to extract clean keywords for comparison
 */
const calculateKeywords = (text = "") => 
  text.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3);

/**
 * Main ATS Scoring Logic (Hybrid Model)
 * Combines Deterministic Rules with AI Semantic Intelligence
 */
const calculateATSScore = ({ resumeText, structuredResume, jobDescription, aiScore = 0, redlineErrors = [] }) => {
  
  // 1. KEYWORD MATCHING LOGIC (Deterministic)
  const jdKeywords = [...new Set(calculateKeywords(jobDescription))];
  const resKeywords = calculateKeywords(resumeText);
  const matched = jdKeywords.filter(k => resKeywords.includes(k));
  
  // Dynamic Keyword Weighting (Max 50 points)
  const keywordMatchRate = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) : 0.5;
  const keywordScore = Math.min(keywordMatchRate * 50, 50); 
  
  // 2. STRUCTURE & SECTION ANALYSIS (Max 30 points)
  // Checks if essential sections like Experience, Education, Skills are present
  const sectionCount = Object.keys(structuredResume.sections || {}).length;
  const structureScore = Math.min(sectionCount * 6, 30);
  
  // 3. READABILITY & REDLINE PENALTY (Max 20 points)
  const wordCount = resumeText.split(/\s+/).length;
  let baseLengthScore = (wordCount > 300 && wordCount < 1200) ? 20 : 10;

  // NEW: Redline Penalty Logic
  // Agar resume mein spelling mistakes (redlines) hain, toh formatting score thoda deduct hoga
  const errorPenalty = Math.min(redlineErrors.length * 2, 10); // Max 10 points penalty for errors
  const finalLengthScore = Math.max(baseLengthScore - errorPenalty, 0);
  
  // Rule-based subtotal (100 Base)
  const ruleScore = Math.min(keywordScore + structureScore + finalLengthScore, 100);

  // 4. HYBRID CALIBRATION (80% AI Intelligence + 20% Structural Rules)
  // AI knows the 'quality' of content, Rules know the 'quantity' and 'format'
  let finalOverallScore;
  if (aiScore > 0) {
    // 80/20 split ensures the AI's deep understanding drives the 90+ scores
    finalOverallScore = (aiScore * 0.8) + (ruleScore * 0.2);
  } else {
    finalOverallScore = ruleScore;
  }

  // 5. FINAL CALIBRATED RESULT
  return {
    overallScore: Math.round(finalOverallScore),
    breakdown: {
      semanticIntelligence: Math.round(aiScore),
      structuralIntegrity: Math.round(ruleScore),
      keywordMatchDensity: `${matched.length}/${jdKeywords.length}`,
      errorPenaltyPoints: errorPenalty // Tracking spelling/grammar impact
    },
    missingKeywords: jdKeywords.filter(k => !resKeywords.includes(k)),
    // Passing errors back for the frontend redline display
    redlineErrors: redlineErrors 
  };
};

module.exports = { calculateATSScore };