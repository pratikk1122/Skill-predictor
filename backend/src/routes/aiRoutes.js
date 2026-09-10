const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Existing routes
router.post('/generate-question', aiController.generateQuestion);
router.post('/evaluate-solution', aiController.evaluateSolution);

// 🔥 NEW ROUTE: Add this line so the frontend can fetch the chart data
router.post('/skill-stats', aiController.getSkillStats);

module.exports = router;