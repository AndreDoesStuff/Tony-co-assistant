import express from 'express';
import Summary from '../models/Summary';
import AIService from '../services/AIService';

const router = express.Router();

// Get all summaries
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const summaries = await Summary.find(query).sort({ updatedAt: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// Create a new summary
router.post('/', async (req, res) => {
  try {
    const { title, type, rawContent, tags } = req.body;

    // Generate AI summary
    const summaryContent = await AIService.generateSummary(rawContent, type);

    const summary = new Summary({
      title,
      type,
      rawContent,
      summaryContent,
      tags,
    });

    await summary.save();
    res.status(201).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create summary' });
  }
});

// Update a summary
router.put('/:id', async (req, res) => {
  try {
    const { summaryContent } = req.body;
    const summary = await Summary.findByIdAndUpdate(
      req.params.id,
      { summaryContent },
      { new: true }
    );
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update summary' });
  }
});

// Delete a summary
router.delete('/:id', async (req, res) => {
  try {
    await Summary.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete summary' });
  }
});

export default router; 