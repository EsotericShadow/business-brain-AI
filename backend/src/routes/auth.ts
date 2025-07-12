import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/environment.js';

const prisma = new PrismaClient();
const router = express.Router();

// --- Mock Email Service ---
// In a real app, this would be a robust service like Mailgun or SendGrid.
const sendLoginEmail = async (email: string, loginLink: string) => {
  console.log(`
    ====================================================
    MOCK EMAIL: Sending login link to ${email}
    ====================================================
    
    Click this link to log in:
    ${loginLink}

    ====================================================
  `);
  // In a real app, you would have error handling here.
  return { success: true };
};

// --- Route to request a magic link ---
router.post('/login', async (req, res) => {
  console.log('[/api/auth/login] Received request to generate magic link.');
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // 1. Find or create the user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`[/api/auth/login] No user found for ${email}. Creating new user.`);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Default name
        },
      });
      // Create a default forwarding address ONLY for new users
      const defaultForwardingAddress = `${user.name.replace(/[^a-zA-Z0-9]/g, '')}@mail.your-app.com`;
      await prisma.forwardingAddress.create({
        data: { email: defaultForwardingAddress, userId: user.id },
      });
      console.log(`[/api/auth/login] New user and forwarding address created for ${email}.`);
    } else {
      console.log(`[/api/auth/login] Found existing user for ${email}.`);
    }

    // 2. Generate a secure, single-use token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.loginToken.create({
      data: {
        id: token,
        userId: user.id,
        expiresAt,
      },
    });
    console.log(`[/api/auth/login] Generated login token for ${email}.`);

    // 3. Send the magic link email
    const loginLink = `${config.CORS_ORIGIN}/auth/verify?token=${token}`;
    await sendLoginEmail(email, loginLink);

    res.json({ message: 'Check your email for a login link.' });
  } catch (error) {
    console.error('Login request failed:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// --- Route to verify the token from the magic link ---
router.get('/verify', async (req, res) => {
    console.log('[/api/auth/verify] Received request to verify token.');
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        console.log('[/api/auth/verify] Invalid or missing token.');
        return res.status(400).redirect(`${config.CORS_ORIGIN}/?error=invalid_token`);
    }

    try {
        const loginToken = await prisma.loginToken.findUnique({
            where: { id: token },
        });

        if (!loginToken || loginToken.expiresAt < new Date()) {
            console.log('[/api/auth/verify] Token is expired or not found.');
            await prisma.loginToken.deleteMany({ where: { id: token } }); // Clean up expired/invalid token
            return res.status(400).redirect(`${config.CORS_ORIGIN}/?error=expired_token`);
        }
        
        console.log(`[/api/auth/verify] Token found and is valid for user ${loginToken.userId}.`);

        // Token is valid, create a session JWT
        const sessionToken = jwt.sign({ userId: loginToken.userId }, config.JWT_SECRET, { expiresIn: '7d' });
        console.log('[/api/auth/verify] Session JWT created.');

        // Invalidate the login token so it can't be reused
        await prisma.loginToken.delete({ where: { id: token } });
        console.log('[/api/auth/verify] Login token has been invalidated.');

        // Redirect to the frontend with the session token
        console.log('[/api/auth/verify] Redirecting to frontend callback.');
        res.redirect(`${config.CORS_ORIGIN}/auth/callback?token=${sessionToken}`);

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(500).redirect(`${config.CORS_ORIGIN}/?error=verification_failed`);
    }
});


export default router;
