const Groq = require("groq-sdk");

// Groq SDK initialization using Environment Variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Helper to safely extract JSON from AI string response
 */
const extractJSON = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      const jsonString = cleaned.substring(start, end + 1);
      return JSON.parse(jsonString);
    }
    return null;
  } catch (err) {
    console.error("JSON Extraction Error:", err);
    return null;
  }
};

/**
 * Main AI Analysis Service
 * Generates ATS Score, Critical Mistakes, and Redline Data for highlighting
 */
const generateResumeAIInsight = async ({ resumeText, jobDescription }) => {
  try {
    const prompt = `
You are a Senior Technical Recruiter and ATS Expert. 
Your task is to analyze the resume for ATS scoring and identify EXACT errors for a "Redline" report.

REQUIRED JSON OUTPUT FORMAT:
{
  "aiATSScore": 95, 
  "mistakes": ["General summary of weaknesses"],
  "suggestions": ["Strategic advice to improve score"],
  "redlineErrors": [
    {
      "original": "THE EXACT SENTENCE OR PHRASE FROM THE RESUME WITH THE ERROR",
      "correction": "THE CORRECTED VERSION",
      "type": "spelling" or "grammar" or "formatting"
    }
  ],
  "riskAnalysis": { 
    "lengthRisk": "Low/Medium/High", 
    "keywordRisk": "Low/Medium/High", 
    "formatRisk": "Low/Medium/High" 
  },
  "recruiterSimulation": { 
    "firstImpressionScore": 9.5, 
    "recruiterAttentionSummary": "Recruiter's perspective on the candidate profile" 
  }
}

CRITICAL INSTRUCTIONS:
1. SCORING: Be accurate. 85-100 for top-tier resumes, 70-84 for strong matches.
2. REDLINE ERRORS: You MUST capture the EXACT sentence/word from the resume so the system can locate it for highlighting. Do not paraphrase the original text.
3. SPELLING: Identify common technical misspellings (e.g., 'Pyton' vs 'Python', 'Javascript' vs 'JavaScript').
4. CONTEXT: If the Job Description is provided, prioritize skill-gap analysis.

Resume Content:
${resumeText}

Job Description:
${jobDescription || "Analyze as a general professional technical profile."}
`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Sabse low temperature taaki AI text ke sath 'creative' na ho aur exact text return kare
    });

    const content = response.choices?.[0]?.message?.content || "";
    const parsed = extractJSON(content);

    // Default Fallback agar AI parsing fail ho jaye
    if (!parsed) {
      return {
        aiATSScore: 50,
        mistakes: ["AI Analysis parsing failed."],
        suggestions: ["Please try re-uploading the resume."],
        redlineErrors: [],
        riskAnalysis: { lengthRisk: "Unknown", keywordRisk: "Unknown", formatRisk: "Unknown" },
        recruiterSimulation: { firstImpressionScore: 5, recruiterAttentionSummary: "Unable to evaluate." }
      };
    }

    return parsed;

  } catch (err) {
    console.error("RESUME AI SERVICE ERROR:", err);
    return {
      aiATSScore: 40,
      mistakes: ["AI Engine connection error."],
      redlineErrors: [],
      suggestions: ["Check your API configuration and try again."]
    };
  }
};

module.exports = { generateResumeAIInsight };