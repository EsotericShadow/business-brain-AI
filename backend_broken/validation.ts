// backend-examples/validation.ts
// This file demonstrates how to use Zod for robust backend validation.

import express from 'express';
import { z, ZodError } from 'zod';

// Example Schema for a chat request
export const chatRequestSchema = z.object({
  body: z.object({
    prompt: z.string({
      required_error: "Prompt is required",
    })
    .min(1, "Prompt cannot be empty")
    .max(5000, "Prompt is too long"),
  }),
});

// Generic validation middleware factory
export const validate = (schema: z.AnyZodObject) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
          errors: (error as ZodError).flatten().fieldErrors,
        });
      }
      // Handle other unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
};