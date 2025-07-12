import express from 'express';
import { GmailService } from '../services/gmailService';
import { verifyJwt } from '../middleware/auth';
import { usersDB } from '../db';

const router = express.Router();

// Get emails
router.get('/emails', verifyJwt, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = usersDB.get(userId);

    if (!user || !user.gmailAccessToken) {
      return res.status(403).json({ error: 'Gmail not connected. Please grant permissions.' });
    }

    const gmailService = new GmailService({
        access_token: user.gmailAccessToken,
        refresh_token: user.gmailRefreshToken,
    });
    const emails = await gmailService.getEmails();
    
    res.json(emails);
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Send email
router.post('/send', verifyJwt, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = usersDB.get(userId);

    if (!user || !user.gmailAccessToken) {
      return res.status(403).json({ error: 'Gmail not connected. Please grant permissions.' });
    }

    const gmailService = new GmailService({
        access_token: user.gmailAccessToken,
        refresh_token: user.gmailRefreshToken,
    });
    await gmailService.sendEmail(to, subject, body);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
