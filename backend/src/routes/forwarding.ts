import express from 'express';
import { verifyJwt } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all forwarding addresses for the user
router.get('/', verifyJwt, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const addresses = await prisma.forwardingAddress.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, addresses });
});

// Add a new forwarding address
router.post('/', verifyJwt, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const newAddress = await prisma.forwardingAddress.create({
            data: { email, userId },
        });
        res.json({ success: true, address: newAddress });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create address. It may already be in use.' });
    }
});

// Delete a forwarding address
router.delete('/:id', verifyJwt, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const { id } = req.params;
    try {
        await prisma.forwardingAddress.delete({
            where: { id, userId }, // Ensures user can only delete their own addresses
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete address.' });
    }
});

export default router;
