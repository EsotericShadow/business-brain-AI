// backend-examples/auth.ts
// This is a blueprint for your backend's Google OAuth callback route.
// It requires libraries like `express`, `jsonwebtoken`, `google-auth-library`, and `crypto`.

import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const JWT_SECRET = process.env.JWT_SECRET!;

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${SERVER_URL}/api/auth/google/callback` // Your redirect URI
);

// This would be your user model/database functions
const findOrCreateUser = async (googleProfile: any) => {
    // Logic to find a user in your DB by googleId or email,
    // or create a new user if they don't exist.
    // For this example, we'll return a mock user.
    return {
        id: 'user_db_id_123',
        email: googleProfile.email,
        name: googleProfile.name,
    };
};

export const googleCallbackHandler = async (req: express.Request, res: express.Response) => {
    const { code } = req.query;

    try {
        // 1. Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);

        // Here you would securely store `tokens.refresh_token` in your database
        // associated with the user for long-term access.

        // 2. Get user profile from Google
        const { data: profile } = await oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

        // 3. Find or create user in your database
        const user = await findOrCreateUser(profile);

        // 4. Create a JWT for the user session
        const jwtPayload = { userId: user.id };
        const sessionToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' });

        // 5. Create and set a CSRF token for security
        const csrfToken = crypto.randomBytes(100).toString('hex');
        res.cookie('csrf_token', csrfToken, {
            httpOnly: true, // Prevents JS access
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
            sameSite: 'lax',
        });

        // 6. Redirect the user back to the frontend with the session token
        // In a real app, you might use a more secure method than query params.
        res.redirect(`${CLIENT_URL}/auth/callback?token=${sessionToken}`);

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
};