const Groq = require("groq-sdk");
const User = require("../models/User");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* =====================================================
   GENERATE QUESTION (HANDLES BOTH COMPANY & APTITUDE)
===================================================== */
exports.generateQuestion = async (req, res) => {
  try {
    const { userId, company, topic, difficulty, type } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 SMART CHECK: Is this an Aptitude test or a Company test?
    const subject = type === 'aptitude' ? topic : company;
    if (!subject) return res.status(400).json({ message: "Missing topic or company name" });

    const history = user.interviewHistory || [];
    const previousQuestions = history
      .filter(h => h.company && h.company.toLowerCase() === subject.toLowerCase())
      .map(h => h.questionText).slice(-10);

    let attempt = 0;
    let maxAttempts = 2;
    let completion;

    // 🔥 DYNAMIC PROMPTS based on test type
    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'aptitude') {
      systemPrompt = `You are an expert examiner creating ${subject} aptitude assessments. Generate one multiple-choice question. You MUST respond ONLY with a valid JSON object.`;
      userPrompt = `Generate 1 unique MCQ for ${subject}. Difficulty: ${difficulty}. Avoid these topics: ${JSON.stringify(previousQuestions)}. 
        Format EXACTLY as:
        {
          "title": "Specific Sub-topic (e.g. Percentages, Syllogism)",
          "question": "The full question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "Option 1",
          "explanation": "Detailed explanation"
        }
        CRITICAL RULES:
        1. The 'options' array must contain exactly 4 strings. Do NOT use prefixes like "A)", "B)".
        2. The 'correctAnswer' MUST exactly match one of the option strings.`;
    } else {
      systemPrompt = `You are an expert technical recruiter at ${company}. Generate one multiple-choice question. You MUST respond ONLY with a valid JSON object.`;
      userPrompt = `Generate 1 unique MCQ for a software engineering role at ${company}. Difficulty: ${difficulty}. Avoid these topics: ${JSON.stringify(previousQuestions)}. 
        Format EXACTLY as:
        {
          "title": "Topic Name",
          "question": "The full question text",
          "options": ["First option", "Second option", "Third option", "Fourth option"],
          "correctAnswer": "First option",
          "explanation": "Detailed explanation"
        }
        CRITICAL RULES:
        1. The 'options' array must contain exactly 4 strings. Do NOT use prefixes like "A)", "B)".
        2. The 'correctAnswer' MUST exactly match one of the option strings.`;
    }

    // Auto-Retry Loop for JSON formatting safety
    while (attempt < maxAttempts) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", 
          response_format: { type: "json_object" }
        });

        break; // If successful, exit the retry loop
      } catch (err) {
        attempt++;
        if (attempt >= maxAttempts) throw err;
      }
    }

    const questionData = JSON.parse(completion.choices[0].message.content);
    
    // Save the subject (Mathematics, Google, etc.) under 'company' so the Radar Chart catches it automatically
    if (!user.interviewHistory) user.interviewHistory = [];
    user.interviewHistory.push({ 
      company: subject, 
      questionText: questionData.title, 
      difficulty 
    });
    
    await user.save();
    res.json({ success: true, question: questionData });
  } catch (error) {
    console.error("🚨 AI GENERATION ERROR:", error); 
    res.status(500).json({ message: "Failed to generate a valid question." });
  }
};

/* =====================================================
   EVALUATE SOLUTION
===================================================== */
exports.evaluateSolution = async (req, res) => {
  try {
    const { userId, userAnswer, correctAnswer, questionTitle } = req.body;
    const isCorrect = userAnswer === correctAnswer;
    const score = isCorrect ? 100 : 0;

    const user = await User.findById(userId);
    
    if (user && user.interviewHistory && user.interviewHistory.length > 0) {
      const lastEntry = user.interviewHistory[user.interviewHistory.length - 1];
      if (lastEntry.questionText === questionTitle) {
        lastEntry.score = score;
        lastEntry.isCorrect = isCorrect;
        lastEntry.userAnswer = userAnswer;
        await user.save();
      }
    }

    res.json({
      success: true,
      evaluation: { isCorrect, score, feedback: isCorrect ? "Mastered!" : "Review needed." }
    });
  } catch (error) {
    console.error("🚨 AI EVALUATION ERROR:", error); 
    res.status(500).json({ message: "AI Evaluation Error" });
  }
};

/* =====================================================
   GET SKILL STATS (FOR RADAR CHART)
===================================================== */
exports.getSkillStats = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const history = user.interviewHistory || [];
    const companyStats = {};
    
    history.forEach(entry => {
      if (entry.isCorrect !== undefined) {
        if (!companyStats[entry.company]) {
          companyStats[entry.company] = { total: 0, correct: 0 };
        }
        companyStats[entry.company].total += 1;
        if (entry.isCorrect) companyStats[entry.company].correct += 1;
      }
    });

    const radarData = Object.keys(companyStats).map(company => ({
      subject: company,
      A: Math.round((companyStats[company].correct / companyStats[company].total) * 100),
      fullMark: 100
    }));

    res.json({ success: true, data: radarData });
  } catch (error) {
    console.error("🚨 SKILL STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch skill stats" });
  }
};

/* =====================================================
   GET AI TUTOR HINT (FOR APTITUDE PRACTICE)
===================================================== */
exports.getAptitudeHint = async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful, encouraging math and logic tutor. Provide a brief, clever hint (1-2 sentences max) to help the student figure out the logic or formula needed to solve the problem. You MUST NOT reveal the exact correct answer." 
        },
        { 
          role: "user", 
          content: `Question: ${question}\nOptions: ${options.join(', ')}\nCorrect Answer (DO NOT REVEAL): ${correctAnswer}\n\nPlease give me a short hint.` 
        }
      ],
      model: process.env.GROQ_MODEL_FAST || process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    });

    res.json({ success: true, hint: completion.choices[0].message.content });
  } catch (error) {
    console.error("🚨 AI HINT ERROR:", error);
    res.status(500).json({ message: "Failed to generate hint" });
  }
};