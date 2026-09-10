// ============================================
// APTITUDE AI SERVICE (LIVE ADAPTIVE ENGINE)
// Single Question Generator - Production Safe
// ============================================

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ===============================
// Normalize Category
// ===============================
const normalizeCategory = (category) => {
  if (!category) return "";

  const c = category.toLowerCase().trim();

  if (c.includes("math") || c.includes("quant"))
    return "Mathematics";

  if (c.includes("logic"))
    return "Logical Reasoning";

  if (c.includes("verb"))
    return "Verbal Ability";

  return category;
};

// ===============================
// Convert Level to Difficulty
// ===============================
const levelToDifficulty = (level) => {
  if (level === 1) return "easy";
  if (level === 2) return "medium";
  return "hard";
};

// ===============================
// Generate Single Question
// ===============================
const generateSingleQuestion = async (category, level) => {
  try {
    const normalizedCategory = normalizeCategory(category);
    const difficulty = levelToDifficulty(level);

    const prompt = `
Generate EXACTLY 1 multiple choice aptitude question.

Category: ${normalizedCategory}
Difficulty: ${difficulty}

Return strictly this JSON format:

{
  "question": "string",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "must exactly match one option",
  "explanation": "short explanation"
}

Return ONLY JSON.
No markdown.
No extra text.
`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = response.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    // Clean markdown if present
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON structure");
    }

    const jsonString = cleaned.slice(start, end + 1);

    const parsed = JSON.parse(jsonString);

    return {
      success: true,
      question: parsed,
    };
  } catch (err) {
    console.error("❌ Single Question AI Error:", err.message);
    return {
      success: false,
      message: "Failed to generate question",
    };
  }
};

// ===============================
// EXPORT
// ===============================
module.exports = { generateSingleQuestion };
