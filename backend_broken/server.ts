// backend-examples/server.ts
// This file provides a blueprint for a secure Node.js/Express server.
// It shows how all the security pieces fit together.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { googleCallbackHandler } from './auth';
import { verifyJwt, verifyCsrf } from './middleware';
import { validate, chatRequestSchema } from './validation';

const app = express();
app.disable('etag');
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL;

// --- Essential Security Middleware ---

// 1. Set various security-related HTTP headers
app.use(helmet());

// 2. Configure CORS to only allow requests from your frontend
app.use(cors({
  origin: CLIENT_URL,
  credentials: true, // Important for cookies
}));

// 3. Parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());


// --- Public Routes (e.g., Authentication) ---

// The route the user is redirected to after logging in with Google
app.get('/api/auth/google/callback', googleCallbackHandler);


// --- Protected Routes (require authentication) ---

// Example of a protected route for handling chat messages
// It uses all our security middleware in sequence.
app.post(
  '/api/chat',
  verifyJwt,         // 1. Is the user logged in? (Valid JWT)
  verifyCsrf,        // 2. Is this request legitimate? (Valid CSRF)
  validate(chatRequestSchema), // 3. Is the data well-formed? (Zod validation)
  (req: express.Request, res: express.Response) => {
    // If we reach here, the request is authenticated, authorized, and validated.
    // Now we can safely process the request.
    const prompt = req.body.prompt;
    // const userId = (req as any).user.userId; // Get user from JWT payload

    // ... your logic to call the Gemini API using your secret API_KEY ...

    res.json({ responseText: `Backend received and processed prompt: "${prompt}"` });
  }
);


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Secure backend server running on port ${PORT}`);
});