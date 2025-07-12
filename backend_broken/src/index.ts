import { config } from './config/environment';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import session from 'express-session';
import type { User } from '@shared/types';
import { prisma } from './db';
import { verifyJwt } from './middleware/auth';
import { GmailAuthService } from './services/gmail-auth.service';

// --- CONFIGURATION & CLIENTS ---
const app = express();
const PORT = config.PORT;
const stripe = new Stripe(config.GMAIL_CLIENT_SECRET, { apiVersion: '2023-08-16' });

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: config.NODE_ENV === 'production' }
}));

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

// --- User Management ---
const findOrCreateUser = async (googleProfile: { sub: string, email: string, name: string, picture: string }, tokens: { refreshToken?: string | null, accessToken?: string | null }): Promise<User> => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  const userData = {
    id: googleProfile.sub,
    email: googleProfile.email,
    name: googleProfile.name,
    avatarUrl: googleProfile.picture,
    gmailAccessToken: tokens.accessToken,
    gmailRefreshToken: tokens.refreshToken,
    trialEndsAt: trialEndDate,
  };

  const user = await prisma.user.upsert({
    where: { id: googleProfile.sub },
    update: {
      name: googleProfile.name,
      avatarUrl: googleProfile.picture,
      gmailAccessToken: tokens.accessToken,
      gmailRefreshToken: tokens.refreshToken,
    },
    create: {
      ...userData,
      // Create a stripe customer only for new users
      stripeCustomerId: (await stripe.customers.create({ email: googleProfile.email, name: googleProfile.name })).id,
    },
  });

  return user as User;
};


// --- ROUTES ---
import gmailRoutes from './routes/gmail';
import geminiRoutes from './routes/gemini';

app.use('/api/gmail', gmailRoutes);
app.use('/api/gemini', geminiRoutes);

// --- Authentication Routes ---
app.get('/api/auth/google/login', verifyJwt, (req: express.Request, res: express.Response) => {
  const authService = new GmailAuthService(req.user!.userId);
  const url = authService.generateAuthUrl();
  res.redirect(url);
});

app.get('/api/auth/google/callback', verifyJwt, async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).redirect(`${config.CORS_ORIGIN}/?error=auth_failed`);
  }
  
  try {
    const authService = new GmailAuthService(req.user!.userId);
    const { accessToken, refreshToken, userInfo } = await authService.handleAuthCallback(code as string);
    
    await findOrCreateUser(userInfo, { accessToken, refreshToken });
    
    res.redirect(`${config.CORS_ORIGIN}/`);
  } catch (error) {
    console.error('Authentication callback error:', error);
    res.status(500).redirect(`${config.CORS_ORIGIN}/?error=auth_failed`);
  }
});

app.post('/api/auth/session', async (req: express.Request, res: express.Response) => {
    const { email, name } = req.body;
    const googleProfile = { sub: email, email, name, picture: '' };
    const user = await findOrCreateUser(googleProfile, {});
    const sessionToken = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: sessionToken });
});


app.get('/api/me', verifyJwt, async (req: express.Request, res: express.Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: "User not found in token" });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found in database" });
  }
  const { gmailRefreshToken, ...safeUser } = user;
  res.json(safeUser);
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});

