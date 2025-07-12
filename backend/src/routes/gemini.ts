import express from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { verifyJwt } from '../middleware/auth.js';
import { config } from '../config/environment.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

router.post('/chat', verifyJwt, async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const chat = model.startChat({
      history: history || [],
      generationConfig,
      safetySettings,
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    res.json({
      success: true,
      data: {
        type: 'text',
        content: text,
      }
    });

  } catch (error: any) {
    console.error('General AI chat failed:', error);
    res.status(500).json({ success: false, error: 'Failed to get response from AI', details: error.message });
  }
});

export default router;
