import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyJwt } from '../middleware/auth';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post('/chat', verifyJwt, async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ responseText: text });
    } catch (error) {
        console.error('Failed to generate content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

export default router;
