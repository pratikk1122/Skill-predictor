const callGroq = require("../utils/groqClient");

async function evaluateDiscussion(topic, transcript) {

  const prompt = `
You are an AI Moderator in a professional group discussion.

Topic: ${topic}

Transcript:
${transcript}

Tasks:
1. Detect weak arguments.
2. Detect logical fallacies.
3. Score each participant from 1–10.
4. Suggest improvement.
5. Identify who dominated discussion.
6. Provide professional feedback summary.

Return JSON only:

{
  "weakArguments": [],
  "fallacies": [],
  "scores": {
    "User": 7,
    "Rahul": 6,
    "Anita": 8
  },
  "dominance": "Anita",
  "feedback": "Overall summary..."
}
`;

  const response = await callGroq(prompt);
  return JSON.parse(response);
}

module.exports = evaluateDiscussion;