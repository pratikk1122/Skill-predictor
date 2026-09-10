// ============================================
// RISK ANALYZER ENGINE
// ============================================

const analyzeResumeRisk = (resumeText = "", structuredResume = {}) => {
  let risks = {
    keywordStuffingRisk: "Low",
    formattingRisk: "Low",
    genericResumeRisk: "Low",
    lengthRisk: "Low"
  };

  const text = resumeText.toLowerCase();

  // Keyword stuffing detection
  const words = text.split(/\s+/);
  const wordFrequency = {};
  words.forEach(word => {
    if (word.length > 4) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });

  const highFrequencyWords = Object.values(wordFrequency).filter(v => v > 15);
  if (highFrequencyWords.length > 5) {
    risks.keywordStuffingRisk = "High";
  }

  // Formatting risk
  if (!structuredResume.sections.skills || !structuredResume.sections.experience) {
    risks.formattingRisk = "Medium";
  }

  // Generic phrases detection
  const genericPhrases = [
    "hardworking",
    "team player",
    "quick learner",
    "responsible for",
    "worked on"
  ];

  const genericCount = genericPhrases.filter(p => text.includes(p)).length;
  if (genericCount > 2) {
    risks.genericResumeRisk = "High";
  }

  // Length risk
  if (resumeText.length < 300) {
    risks.lengthRisk = "High";
  } else if (resumeText.length > 6000) {
    risks.lengthRisk = "Medium";
  }

  return risks;
};

module.exports = { analyzeResumeRisk };
