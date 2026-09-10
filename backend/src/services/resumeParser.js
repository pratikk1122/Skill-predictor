// ================================
// PROFESSIONAL RESUME PARSER (UPGRADED)
// Phase 1 → Structured + ATS Ready
// ================================

// Existing AI resume analyzer (Fixed Model Name & Parsing)
const analyzeResumeWithAI = async (resumeText, aiClient) => {
  const prompt = `
Extract structured data from this resume.
Return ONLY a valid JSON object. Do not include any introductory text or markdown formatting.

Format:
{
  "roleDetected": "string",
  "experienceLevel": "string",
  "skills": ["array of strings"],
  "strengths": ["array of strings"],
  "weakAreas": ["array of strings"]
}

Resume Text:
${resumeText}
`;

  try {
    const completion = await aiClient.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", 
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Kam temperature se JSON output better milta hai
    });

    let content = completion.choices[0].message.content.trim();
    
    // Cleaning: Agar AI markdown (```json ... ```) bhej de toh usse saaf karein
    if (content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI Parsing Error:", error.message);
    // Fallback object agar AI fail ho jaye
    return {
      roleDetected: "Unknown",
      experienceLevel: "Unknown",
      skills: [],
      strengths: [],
      weakAreas: [],
    };
  }
};

// =====================================================
// NEW: ADVANCED STRUCTURED RESUME PARSER
// =====================================================

const parseResumeSections = (resumeText = "") => {
  const lowerText = resumeText.toLowerCase();

  const sectionPatterns = {
    summary: /summary|professional summary|profile/i,
    skills: /skills|technical skills/i,
    experience: /experience|work experience|employment/i,
    education: /education/i,
    projects: /projects/i,
    certifications: /certifications|certificates/i,
  };

  const sections = {};

  Object.keys(sectionPatterns).forEach((section) => {
    const match = lowerText.match(sectionPatterns[section]);
    sections[section] = match ? true : false;
  });

  return sections;
};

// =====================================================
// NEW: BULLET EXTRACTION
// =====================================================

const extractBullets = (resumeText = "") => {
  const lines = resumeText.split("\n");
  const bullets = lines.filter(line =>
    line.trim().startsWith("-") ||
    line.trim().startsWith("•") ||
    line.trim().match(/^\d+\./)
  );
  return bullets;
};

// =====================================================
// NEW: IMPACT STATEMENT DETECTOR
// =====================================================

const calculateImpactDensity = (resumeText = "") => {
  const sentences = resumeText.split(/[.!?]/); // Better sentence splitting
  const impactKeywords = [
    "increased", "reduced", "improved", "optimized",
    "boosted", "generated", "%", "achieved", "delivered",
    "managed", "led", "developed", "saved"
  ];

  let impactCount = 0;

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const hasKeyword = impactKeywords.some(keyword => lowerSentence.includes(keyword));
    if (hasKeyword) impactCount++;
  });

  const density = sentences.length > 0
    ? Math.min(100, Math.round((impactCount / sentences.length) * 100))
    : 0;

  return {
    totalSentences: sentences.length,
    impactStatements: impactCount,
    impactDensityScore: density
  };
};

// =====================================================
// NEW: COMPLETE STRUCTURED RESUME OBJECT
// =====================================================

const buildStructuredResume = (resumeText = "") => {
  return {
    rawText: resumeText,
    sections: parseResumeSections(resumeText),
    bullets: extractBullets(resumeText),
    impactAnalysis: calculateImpactDensity(resumeText),
    length: resumeText.length,
    wordCount: resumeText.trim().split(/\s+/).length,
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  analyzeResumeWithAI,
  parseResumeSections,
  extractBullets,
  calculateImpactDensity,
  buildStructuredResume
};