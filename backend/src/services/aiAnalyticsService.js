/* ================= IMPORT MODEL ================= */

const Analytics = require("../models/Analytics");


/* ================= CALCULATE SKILL SCORES ================= */

async function calculateSkillScores(studentId) {

  let data = await Analytics.findOne({ studentId });

  if (!data) {

    data = new Analytics({
      studentId
    });

  }

  /* Basic AI scoring logic */

  const communication = Math.min((data.gdSessions || 0) * 2, 10);

  const technical = Math.min((data.resumeScore || 0) / 10, 10);

  const problemSolving = Math.min((data.aptitudeScore || 0) / 10, 10);

  const confidence = Math.min((data.interviewScore || 0) / 10, 10);

  const leadership = Math.min((data.gdScore || 0) / 10, 10);

  data.communication = communication;
  data.technical = technical;
  data.problemSolving = problemSolving;
  data.confidence = confidence;
  data.leadership = leadership;

  await data.save();

  return data;

}


/* ================= DETECT WEAKNESSES ================= */

function detectWeakness(data) {

  const weaknesses = [];

  if (data.communication < 5) weaknesses.push("Communication");

  if (data.technical < 5) weaknesses.push("Technical Skills");

  if (data.problemSolving < 5) weaknesses.push("Problem Solving");

  if (data.confidence < 5) weaknesses.push("Confidence");

  if (data.leadership < 5) weaknesses.push("Leadership");

  return weaknesses;

}


/* ================= CAREER PREDICTION ================= */

function predictCareer(data) {

  if (data.technical > 7 && data.problemSolving > 7) {

    return "Backend Developer";

  }

  if (data.communication > 7 && data.leadership > 6) {

    return "Business Analyst";

  }

  if (data.problemSolving > 7) {

    return "Data Analyst";

  }

  return "Software Developer";

}


/* ================= GENERATE STUDY PLAN ================= */

function generateStudyPlan(weaknesses) {

  const plan = [];

  if (weaknesses.includes("Communication")) {

    plan.push({
      week: 1,
      focus: "Practice speaking and mock interviews"
    });

  }

  if (weaknesses.includes("Technical Skills")) {

    plan.push({
      week: 2,
      focus: "Improve coding skills and projects"
    });

  }

  if (weaknesses.includes("Problem Solving")) {

    plan.push({
      week: 3,
      focus: "Solve aptitude and algorithm problems"
    });

  }

  if (weaknesses.includes("Confidence")) {

    plan.push({
      week: 4,
      focus: "Participate in mock interviews and GD"
    });

  }

  if (plan.length === 0) {

    plan.push({
      week: 1,
      focus: "Maintain current preparation and practice mock tests"
    });

  }

  return plan;

}


/* ================= AI INSIGHTS ================= */

function generateAIInsights(data, weaknesses) {

  let insight = "";

  if (weaknesses.length === 0) {

    insight =
      "You are performing well across all skills. Focus on advanced preparation and company specific tests.";

  } else {

    insight =
      "You have strong potential but need improvement in: " +
      weaknesses.join(", ") +
      ". Focus on targeted practice to improve your placement readiness.";

  }

  return insight;

}


/* ================= PLACEMENT READINESS SCORE ================= */

function calculatePlacementScore(data) {

  const score =
    (data.communication +
      data.technical +
      data.problemSolving +
      data.confidence +
      data.leadership) / 5;

  return Math.round(score * 10);

}


/* ================= MAIN AI ANALYSIS ================= */

async function runFullAIAnalysis(studentId) {

  const data = await calculateSkillScores(studentId);

  const weaknesses = detectWeakness(data);

  const career = predictCareer(data);

  const studyPlan = generateStudyPlan(weaknesses);

  const insight = generateAIInsights(data, weaknesses);

  const placementScore = calculatePlacementScore(data);

  data.aiInsights = insight;

  data.improvementSuggestions = weaknesses;

  data.predictedCareer = career;

  await data.save();

  return {

    skills: {
      communication: data.communication,
      technical: data.technical,
      problemSolving: data.problemSolving,
      confidence: data.confidence,
      leadership: data.leadership
    },

    weaknesses,

    career,

    studyPlan,

    insight,

    placementScore

  };

}


/* ================= EXPORTS ================= */

module.exports = {

  calculateSkillScores,

  detectWeakness,

  predictCareer,

  generateStudyPlan,

  generateAIInsights,

  calculatePlacementScore,

  runFullAIAnalysis

};