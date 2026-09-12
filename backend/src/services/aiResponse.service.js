const { Groq } = require("groq-sdk");
const apiKey = process.env.GROQ_API_KEY || "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";
let groq = null;
if (apiKey) {
  try {
    groq = new Groq({ apiKey });
  } catch (e) {
    console.warn("Groq initialization warning:", e.message);
  }
}

/**
 * 🔥 MASTER SYSTEM PROMPT (VARIATION & STRICT ENGLISH)
 */
const SKILL_PREDICTOR_CONTEXT = `
You are the official AI Assistant for "SkillPredictor".
Your goal is to provide helpful, direct answers about our platform.

🔥 ANTI-REPETITION RULE:
- If a user asks the same question multiple times, DO NOT give a carbon-copy answer.
- Change your sentence structure, use synonyms, and vary your opening/closing phrases.
- Keep the core information accurate but refresh the delivery style.

🔥 STRICT LANGUAGE & TONE:
- RESPOND ONLY IN ENGLISH. 
- DO NOT USE HINDI SCRIPT. 
- Use a natural Indian English accent.
- Keep answers professional, encouraging, and "to the point".

KNOWLEDGE BASE:
1. Resume Scorer: AI-powered ATS analysis. Link: /resume-scorer
2. Mock Interview: Technical/HR practice with voice feedback. Link: /ai-interview
3. Aptitude: Quant, Verbal, and Logical tests. Link: /aptitude-test
4. Company Prep: Tailored modules for Tech Giants. Link: /company-prep
5. Authentication: For login/OTP/reset issues, provide a troubleshooting checklist.
`;

/**
 * 🔥 GENERATE AI RESPONSE
 */
exports.generateAIResponse = async (userQuery) => {
  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL_FAST || process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: SKILL_PREDICTOR_CONTEXT },
        { role: "user", content: userQuery }
      ],
      // 🔥 INCREASED TEMPERATURE: 0.7 value helps in generating diverse responses
      // instead of returning the same text every time.
      temperature: 0.7, 
      max_tokens: 500,
      // 🔥 TOP_P: Helps in adding more randomness to word selection
      top_p: 0.9, 
    });

    return response.choices[0]?.message?.content || "I'm here to help you in English!";
  } catch (error) {
    console.error("GROQ SERVICE ERROR 👉", error);
    return "AI is processing many requests. Please try again shortly.";
  }
};