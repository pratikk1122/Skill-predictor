const { buildStructuredResume, analyzeResumeWithAI } = require("./resumeParser");
const { calculateATSScore } = require("./atsEngine");
const { generateResumeAIInsight } = require("./resumeIntelligenceAI");
const { analyzeResumeRisk } = require("./riskAnalyzer");
const { simulateRecruiterScan } = require("./recruiterSimulation");

const analyzeResumeIntelligence = async ({ resumeText, jobDescription = "", aiClient }) => {
  try {
    // Parallel Execution for speed
    const [aiInsight, structuredResume] = await Promise.all([
      generateResumeAIInsight({ resumeText, jobDescription }),
      buildStructuredResume(resumeText)
    ]);

    // Calculate Hybrid Score (AI + Math)
    const atsResult = calculateATSScore({
      resumeText,
      structuredResume,
      jobDescription,
      aiScore: aiInsight.aiATSScore
    });

    // Deep Analysis
    const aiStructuredData = await analyzeResumeWithAI(resumeText, aiClient);
    const riskAnalysis = analyzeResumeRisk(resumeText, structuredResume);
    const recruiterSimulation = simulateRecruiterScan(resumeText);

    return {
      overallScore: atsResult.overallScore, // Calibrated 90+ score
      breakdown: atsResult.breakdown,
      missingKeywords: atsResult.missingKeywords,
      
      structuredData: aiStructuredData,
      recruiterSimulation,
      riskAnalysis,
      
      mistakes: aiInsight.mistakes,
      suggestions: aiInsight.suggestions,
      aiReasoning: aiInsight.reasoning,
      recruiterImpression: aiInsight.recruiterSimulation?.firstImpressionScore,
    };

  } catch (error) {
    console.error("CRITICAL SERVICE ERROR:", error);
    throw new Error("Resume Analysis Intelligence Failed.");
  }
};

module.exports = { analyzeResumeIntelligence };