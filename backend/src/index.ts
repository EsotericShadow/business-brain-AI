import { config } from './config/environment.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import session from 'express-session';
import type { User } from '@shared/types/index.js';
import { prisma } from './db.js';
import { verifyJwt } from './middleware/auth.js';

// --- CONFIGURATION & CLIENTS ---
const app = express();
const PORT = config.PORT;
const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

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

// --- ROUTES ---
import authRoutes from './routes/auth.js';
import geminiRoutes from './routes/gemini.js';
import ingestRoutes from './routes/ingest.js';
import emailRoutes from './routes/emails.js';
import forwardingRoutes from './routes/forwarding.js';

app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/forwarding-addresses', forwardingRoutes);

app.post('/api/auth/session', async (req: express.Request, res: express.Response) => {
    const { email, name } = req.body;
    // This route is now effectively deprecated by the magic link flow,
    // but we'll keep it for now to avoid breaking any existing frontend logic
    // that might still be using it. It should be removed eventually.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const sessionToken = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token: sessionToken });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
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
  res.json(user);
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
