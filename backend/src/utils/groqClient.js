const axios = require("axios");

async function callGroq(prompt) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL_FAST || process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("GROQ STATUS:", error.response?.status);
    console.error("GROQ ERROR:", error.response?.data);
    throw new Error("Groq API failed");
  }
}

module.exports = callGroq;