const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =====================================================
   DIFFICULTY INSTRUCTION HELPER
===================================================== */
const getDifficultyInstruction = (difficulty = "medium") => {
  switch (difficulty) {
    case "easy":
      return `
Ask an EASY level interview question.
- Focus on basic concepts.
- Avoid deep system design.
- Avoid complex algorithms.
- Suitable for freshers.
`;
    case "hard":
      return `
Ask a HARD level interview question.
- Can include advanced concepts.
- May include architecture, optimization, or edge cases.
- Suitable for experienced candidates.
`;
    default:
      return `
Ask a MEDIUM level interview question.
- Focus on practical real-world understanding.
- Avoid very deep system design.
- Avoid extreme algorithm difficulty.
- Suitable for 1-3 years experience.
`;
  }
};

/* =====================================================
   GENERATE FIRST QUESTION (DIFFICULTY AWARE)
===================================================== */
const generateFirstQuestion = async (
  analysis,
  difficulty = "medium"
) => {
  const difficultyInstruction = getDifficultyInstruction(difficulty);

  const prompt = `
You are a professional technical interviewer.

Candidate Role: ${analysis.roleDetected}
Experience: ${analysis.experienceLevel}
Skills: ${analysis.skills?.join(", ")}

${difficultyInstruction}

Ask the first realistic interview question.
Only ask one question.
Do NOT add explanation.
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
};

/* =====================================================
   ANALYZE ANSWER + FOLLOW UP (DIFFICULTY AWARE)
===================================================== */
const analyzeAnswerAndFollowUp = async (
  analysis,
  transcript,
  difficulty = "medium"
) => {
  const lastEntry = transcript[transcript.length - 1];

  const difficultyInstruction = getDifficultyInstruction(difficulty);

  const prompt = `
You are analyzing a mock interview.

Candidate Role: ${analysis.roleDetected}
Experience: ${analysis.experienceLevel}

Question: ${lastEntry.question}
Answer: ${lastEntry.answer}

${difficultyInstruction}

Give JSON response strictly in this format:
{
  "technical_score": number (0-10),
  "communication_score": number (0-10),
  "confidence_score": number (0-10),
  "improvement": [
      {
        "category": "string",
        "description": "string"
      }
  ],
  "follow_up_question": "string"
}

Only return valid JSON.
Do not add explanation outside JSON.
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      technical_score: 5,
      communication_score: 5,
      confidence_score: 5,
      improvement: [
        {
          category: "General",
          description: "Try to explain your answer more clearly with examples.",
        },
      ],
      follow_up_question: "Can you explain that in more detail?",
    };
  }
};

module.exports = {
  generateFirstQuestion,
  analyzeAnswerAndFollowUp,
};
