import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const environmentSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default(8000),
  
  // Security Configuration
  SESSION_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Gmail API Configuration
  GMAIL_CLIENT_ID: z.string().min(1),
  GMAIL_CLIENT_SECRET: z.string().min(1),
  GMAIL_REDIRECT_URI: z.string().url().default('http://localhost:8000/api/auth/google/callback'),

  // AI Service Configuration
  GEMINI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().default('gemini-pro'),

  // Database Configuration
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

// Validate environment variables and export the config
// In a real app, you'd also handle the case where parsing fails.
export const config = environmentSchema.parse(process.env);
