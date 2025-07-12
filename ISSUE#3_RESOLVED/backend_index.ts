import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ZodError, z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { GoogleGenAI } from "@google/genai";
import Stripe from 'stripe';
import session from 'express-session';
import type { User } from '../types'; // Corrected import path
import { PLAN_DETAILS, TOKEN_PACKS } from '../utils/initialData'; // Corrected import path


// Load environment variables from .env file
dotenv.config(); // Removed hardcoded path

// --- CONFIGURATION & CLIENTS ---
const app = express();
const PORT = process.env.PORT || 8000;
const {
  CLIENT_URL,
  SERVER_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  API_KEY,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET
} = process.env;

if (!CLIENT_URL || !SERVER_URL || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !JWT_SECRET || !API_KEY || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing critical environment variables. Check your .env file.");
}

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${SERVER_URL}/api/auth/google/callback`);
const ai = new GoogleGenAI({ apiKey: API_KEY });
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' }); // Updated API version

import { usersDB } from './db';
import { verifyJwt } from './middleware/auth';

const findOrCreateUser = async (googleProfile: { sub: string, email: string, name: string, picture: string }, tokens: { refresh_token?: string | null, access_token?: string | null }): Promise<User> => {
  let user = usersDB.get(googleProfile.sub);
  if (user) {
    // Update tokens for existing user
    if (tokens.refresh_token) {
      user.refreshToken = tokens.refresh_token; 
      user.gmailRefreshToken = tokens.refresh_token;
    }
    if (tokens.access_token) {
        user.gmailAccessToken = tokens.access_token;
    }
  } else {
    // New user, create a Stripe customer for them
    const customer = await stripe.customers.create({
        email: googleProfile.email,
        name: googleProfile.name,
    });
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    user = {
      id: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      avatarUrl: googleProfile.picture,
      refreshToken: tokens.refresh_token || null,
      gmailAccessToken: tokens.access_token || null,
      gmailRefreshToken: tokens.refresh_token || null,
      stripeCustomerId: customer.id,
      planId: 'free', // Start with free trial plan
      tokenBalance: 500, // Initial tokens for trial
      trialEndsAt: trialEndDate.toISOString(),
    };
    usersDB.set(googleProfile.sub, user);
    console.log(`New user created: ${user.name} with Stripe ID: ${user.stripeCustomerId}. Trial ends at ${user.trialEndsAt}`);
  }
  return user;
};

// --- MIDDLEWARE ---
// Must be before any JSON parsing for Stripe webhook signature verification
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), async (req: express.Request, res: express.Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string); // Fixed Stripe secret
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const { userId, itemType, itemId } = session.metadata || {};
        const user = usersDB.get(userId);

        if (user) {
            if (itemType === 'plan') {
                const plan = PLAN_DETAILS.find((p: any) => p.id === itemId); // Added type for p
                if (plan) {
                    user.planId = plan.id;
                    // Reset token balance to the new plan's monthly allotment
                    user.tokenBalance = plan.tokens;
                    user.trialEndsAt = undefined; // End trial upon subscribing
                    console.log(`User ${user.name} upgraded to ${plan.name} plan.`);
                }
            } else if (itemType === 'pack') {
                const pack = TOKEN_PACKS.find((p: any) => p.id === Number(itemId)); // Added type for p
                if (pack) {
                    user.tokenBalance += pack.tokens;
                     console.log(`User ${user.name} purchased ${pack.name}.`);
                }
            }
            usersDB.set(user.id, user); // Save updated user info
        } else {
            console.error(`Webhook Error: User with ID ${userId} not found.`);
        }
    }

    res.json({received: true});
});


app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

import session from 'express-session';

// Extend Express Request type to include the user payload and session
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
    interface SessionData {
        gmailTokens?: any; // Adjust type as needed
    }
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// --- VALIDATION SCHEMAS AND MIDDLEWARE ---
const chatRequestSchema = z.object({
    body: z.object({
        prompt: z.string({ required_error: "Prompt is required" })
            .min(1, "Prompt cannot be empty")
            .max(5000, "Prompt cannot exceed 5000 characters"),
    }),
});

const validate = (schema: z.AnyZodObject) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Invalid request data",
                errors: error.flatten().fieldErrors,
            });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// --- ROUTES ---

import gmailRoutes from './routes/gmail';

// Add this line with your other routes
app.use('/api/gmail', gmailRoutes);

// 1. Start the Google Login Flow
app.get('/api/auth/google/login', (req: express.Request, res: express.Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important to get a refresh token
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    prompt: 'consent', // Force refresh token to be sent on every login
  });
  res.redirect(url);
});

// 2. Handle the callback from Google
app.get('/api/auth/google/callback', async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const { data: profile } = await oauth2Client.request<{ sub: string, email: string, name:string, picture: string}>({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const user = await findOrCreateUser(profile, tokens);
    
    // The logic to manually set tokens is now inside findOrCreateUser
    // so we can remove it from here.

    const sessionToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${CLIENT_URL}/auth/callback?token=${sessionToken}`);
  } catch (error) {
    console.error('Authentication callback error:', error);
    res.status(500).redirect(`${CLIENT_URL}/?error=auth_failed`);
  }
});

// 3. Verify token and get user data
app.get('/api/me', verifyJwt, (req: express.Request, res: express.Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not found in token" });
  }
  const user = usersDB.get(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found in database" });
  }
  const { refreshToken, gmailAccessToken, gmailRefreshToken, ...safeUser } = user; // Never send tokens to client
  res.json(safeUser);
});

// 4. Protected chat endpoint
app.post('/api/chat', verifyJwt, validate(chatRequestSchema), async (req: express.Request, res: express.Response) => {
  const { prompt } = req.body;
  const userId = req.user?.userId;

  const user = usersDB.get(userId!);
  if (!user) return res.status(404).json({ message: "User not found" });
  
  if (user.tokenBalance <= 0) {
      return res.status(402).json({ responseText: "Your token balance is zero. Please upgrade your plan or purchase more tokens to continue." });
  }

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      // Deduct tokens on successful response
      user.tokenBalance = Math.max(0, user.tokenBalance - 5);
      usersDB.set(userId!, user);

      res.json({ responseText: response.text });
  } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ message: 'Failed to get response from AI model.' });
  }
});

// 5. Stripe Checkout Session Endpoint
app.post('/api/payments/create-checkout-session', verifyJwt, async (req: express.Request, res: express.Response) => {
    const {itemId, itemType} = req.body;
    const userId = req.user?.userId;
    const user = usersDB.get(userId!);

    if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: "User or Stripe customer not found." });
    }
    
    let line_item: Stripe.Checkout.SessionCreateParams.LineItem;
    let mode: Stripe.Checkout.SessionCreateParams.Mode;

    if(itemType === 'plan') {
        const plan = PLAN_DETAILS.find((p: any) => p.id === itemId); // Added type for p
        if (!plan) return res.status(404).json({ message: "Plan not found" });
        mode = 'subscription';
        line_item = {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${plan.name} Plan`,
                    description: `Monthly subscription for Business Brain.`,
                },
                unit_amount: plan.price * 100, // price in cents
                recurring: {
                    interval: 'month',
                },
            },
            quantity: 1,
        }
    } else { // It's a token pack
        const pack = TOKEN_PACKS.find((p: any) => p.id === Number(itemId)); // Added type for p
        if (!pack) return res.status(404).json({ message: "Token pack not found" });
        mode = 'payment';
        line_item = {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: pack.name,
                    description: `One-time purchase of ${pack.tokens.toLocaleString()} tokens.`
                },
                unit_amount: pack.price * 100,
            },
            quantity: 1
        }
    }
    
    try {
        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [line_item],
            mode: mode,
            success_url: `${CLIENT_URL}/payment-success`,
            cancel_url: `${CLIENT_URL}/`,
            metadata: {
                userId: user.id,
                itemId,
                itemType
            }
        });

        res.json({ url: session.url });
    } catch(error: any) {
        console.error("Stripe session creation failed:", error);
        res.status(500).json({ message: 'Failed to create checkout session.' });
    }
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});

