import express from 'express';
import { EmailIngestionService } from '../services/email-ingestion.service.js';

const router = express.Router();

// This is a placeholder for the webhook authentication middleware
// In a real application, this would verify a signature from the email provider
const verifyWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // For now, we'll just log the request and call next()
  // TODO: Implement proper signature verification for Mailgun/SendGrid
  console.log('Received webhook request');
  next();
};

router.post('/email', verifyWebhook, async (req, res) => {
  try {
    const ingestionService = new EmailIngestionService();
    await ingestionService.processInboundEmail(req.body);
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.error('Failed to ingest email:', error);
    if (error.message === 'User not found for forwarding address') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

export default router;
