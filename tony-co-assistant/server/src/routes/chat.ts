import express from 'express';
import Message from '../models/Message';
import Summary from '../models/Summary';
import AIService from '../services/AIService';

const router = express.Router();

// Get conversation history
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message and get AI response
router.post('/messages', async (req, res) => {
  try {
    const { content, conversationId } = req.body;

    // Save user message
    const userMessage = new Message({
      content,
      sender: 'user',
      conversationId,
    });
    await userMessage.save();

    // Get relevant summaries for context
    const summaries = await Summary.find().limit(5);

    // Generate AI response
    const aiResponse = await AIService.generateResponse(content, {
      messages: [userMessage],
      summaries,
    });

    // Save AI response
    const aiMessage = new Message({
      content: aiResponse,
      sender: 'ai',
      conversationId,
    });
    await aiMessage.save();

    res.json({ userMessage, aiMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router; 