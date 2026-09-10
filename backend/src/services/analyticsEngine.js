// ============================================
// ANALYTICS ENGINE (AI PERFORMANCE INSIGHT)
// ============================================

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generatePerformanceInsight = async (data) => {
  try {
    const prompt = `
You are a professional aptitude performance evaluator.

Student Data:
Average Score: ${data.avg}
Consistency: ${data.consistency}
Readiness Score: ${data.readinessScore}

Category Stats:
${JSON.stringify(data.categoryStats)}

Difficulty Stats:
${JSON.stringify(data.difficultyStats)}

Generate:
- Strengths
- Weaknesses
- Improvement Plan
- Final Placement Readiness Comment

Keep it concise and professional.
`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL_FAST || process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return response.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("AI INSIGHT ERROR:", err);
    return "Insight generation failed.";
  }
};

module.exports = { generatePerformanceInsight };
