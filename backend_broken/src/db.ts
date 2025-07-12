import { PrismaClient } from '@prisma/client';

// In production, you'd want to handle Prisma client lifecycle events
// For development, a simple export is fine.
export const prisma = new PrismaClient();
