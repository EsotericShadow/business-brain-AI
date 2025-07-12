import express from 'express';
import { verifyJwt } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Fetch all ingested emails for the authenticated user
router.get('/', verifyJwt, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const emails = await prisma.email.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ success: true, emails });
  } catch (error: any) {
    console.error('Failed to fetch ingested emails:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch emails', details: error.message });
  }
});

// Mark onboarding as completed for the user
router.post('/complete-onboarding', verifyJwt, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { onboardingCompleted: true },
        });

        res.json({ success: true, message: 'Onboarding completed.' });
    } catch (error: any) {
        console.error('Failed to complete onboarding:', error);
        res.status(500).json({ success: false, error: 'Failed to update user', details: error.message });
    }
});


export default router;