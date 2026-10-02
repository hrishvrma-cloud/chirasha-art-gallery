const express = require('express');
const router = express.Router();
const aiService = require('../aiService');

// Get all AI suggestions
router.get('/', (req, res) => {
  try {
    const suggestions = aiService.getSuggestions();
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger AI suggestion generation
router.post('/generate', async (req, res) => {
  try {
    const { custom_topic, target_age } = req.body;
    const suggestions = await aiService.generateSuggestions(custom_topic, target_age);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept suggestion and automatically draft a new weekend session
router.post('/:id/accept', (req, res) => {
  try {
    const { date, time_slot } = req.body;
    const result = aiService.acceptSuggestion(req.params.id, date, time_slot);
    res.json({ message: 'Suggestion accepted and added to upcoming sessions!', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
