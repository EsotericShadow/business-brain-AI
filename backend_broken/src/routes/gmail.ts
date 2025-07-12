import express from 'express';
import { verifyJwt } from '../middleware/auth';
import { AIGmailService } from '../services/ai-gmail.service';

const router = express.Router();

// Route to handle all AI-driven Gmail actions
router.post('/ai', verifyJwt, async (req, res) => {
    try {
        const { prompt, history } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const aiGmailService = new AIGmailService(userId);
        
        // The AI service will now orchestrate everything, including function calls
        const response = await aiGmailService.processUserRequest(prompt, history);
        
        res.json(response);
    } catch (error: any) {
        console.error('Failed to process AI request:', error);
        res.status(500).json({ error: 'Failed to process AI request', details: error.message });
    }
});

export default router;


