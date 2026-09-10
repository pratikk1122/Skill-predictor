const callGroq = require("../utils/groqClient");

/**
 * 🔥 FEATURE 3: Intensity-based bot replies
 * Ab bots difficulty level ke hisaab se behave karenge.
 */
async function generateBotReplies(topic, lastMessage, transcript = "", intensity = "Medium") {
  const prompt = `
You are simulating a professional group discussion.
Topic: ${topic}
Intensity Level: ${intensity}

Participants:
1. Rahul: Aggressive debater, challenges others strongly.
2. Anita: Balanced thinker, looks at pros and cons logically.
3. Priya: Data-driven, always uses statistics or real-world examples.
4. Vikram: Devil's advocate, questions assumptions and finds flaws in arguments.
5. Neha: Peacemaker, tries to summarize and find common ground.
6. Moderator: Interrupts ONLY if the discussion goes off-topic, or to ask a probing question.

Behaviour Based on Intensity:
- Easy: Bots are supportive, agree more often, use simple language, and give the user more space to lead.
- Medium: Standard professional balanced discussion with healthy counter-arguments.
- Hard: Bots are highly critical, use complex corporate jargon, interrupt logically, challenge every assumption, and test the user's pressure handling.

Previous Discussion:
${transcript}

Last Message:
${lastMessage}

Instructions:
1. Generate a reply for exactly ONE bot who should logically respond next to keep the discussion balanced. Do NOT generate multiple replies.
2. If the user's last message is off-topic or if the discussion is stagnating, provide a "moderatorInterrupt" message. Otherwise, leave it null.
3. Keep responses short (1-2 sentences) and natural.

Return ONLY valid JSON format without markdown:
{
  "moderatorInterrupt": "Moderator's question/interruption or null",
  "replies": [
    { "botName": "Priya", "message": "..." }
  ]
}
`;

  try {
    let aiResponse = await callGroq(prompt);
    aiResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(aiResponse);
  } catch (err) {
    console.log("AI error:", err.message);
    return {
      moderatorInterrupt: null,
      replies: [
        { botName: "Anita", message: "That's an interesting perspective, but let's look at the bigger picture." }
      ]
    };
  }
}

/**
 * 🔥 FEATURE 4: Real Performance Scorer with Transcript Highlights
 * Ye function ab detailed metrics aur highlights generate karega.
 */
async function evaluateUserPerformance(topic, transcript) {
  const evaluationPrompt = `
Analyze this Group Discussion performance for the User (identified as 'You' or by their name).
Topic: ${topic}
Full Transcript:
${transcript}

Instructions:
1. Evaluate the user's contribution based on relevance, communication clarity, leadership, and logical reasoning.
2. SCORING RULE: If the user spoke less than 3 times or provided only short/filler answers (like "ok", "yes"), the overallReadiness MUST be below 40.
3. Provide scores out of 100 for Communication, Critical Thinking, and Confidence.
4. Identify 2-3 specific Strong Points (Green) and 1-2 Weak Points (Red) from the user's actual messages.

Return ONLY JSON:
{
  "overallReadiness": 0-100,
  "metrics": {
    "communication": 0-100,
    "criticalThinking": 0-100,
    "confidence": 0-100
  },
  "feedback": "1 short professional sentence on the key area of improvement.",
  "highlights": [
    { "text": "exact snippet of user message", "quality": "Strong" or "Needs Improvement", "reason": "why this was good or bad" }
  ]
}
`;

  try {
    let response = await callGroq(evaluationPrompt);
    response = response.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(response);
  } catch (err) {
    console.error("Evaluation Error:", err.message);
    return {
      overallReadiness: 0,
      metrics: { communication: 0, criticalThinking: 0, confidence: 0 },
      feedback: "Evaluation data processing failed.",
      highlights: []
    };
  }
}

module.exports = { generateBotReplies, evaluateUserPerformance };