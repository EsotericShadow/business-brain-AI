// backend-examples/middleware.ts
// This file provides blueprints for essential security middleware in Express.

import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend the Express Request type to include the user payload from the JWT
// This makes `req.user` available on all `Request` objects in the project.
declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

// 1. JWT Verification Middleware
export const verifyJwt = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded; // Attach user payload to the request object
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};


// 2. CSRF Protection Middleware
export const verifyCsrf = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const csrfTokenFromHeader = req.header('X-CSRF-Token');
  const csrfTokenFromCookie = req.cookies['csrf_token'];

  if (!csrfTokenFromHeader || !csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
    return res.status(403).json({ message: 'Invalid CSRF token.' });
  }
  
  next();
};