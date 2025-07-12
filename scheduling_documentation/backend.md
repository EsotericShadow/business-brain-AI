# Backend Implementation for Scheduled Emails

This document outlines the backend implementation for the scheduled email feature. It includes details on the cron job service and the API endpoints required to manage scheduled emails.

## Cron Job Service

We will use the `node-cron` library to create a cron job that runs every minute to check for scheduled emails to send.

### Installation

```bash
npm install node-cron
```

### Implementation

```javascript
// src/services/schedulerService.ts

import cron from 'node-cron';
import { db } from '../db'; // Assuming you have a db module
import { GmailService } from './gmailService';

export const startScheduler = () => {
  // Schedule a task to run every minute.
  cron.schedule('* * * * *', async () => {
    console.log('Checking for scheduled emails...');
    
    try {
      const scheduledEmails = await db.getScheduledEmailsToSend(); // You'll need to implement this db function
      
      for (const email of scheduledEmails) {
        try {
          const gmailService = new GmailService({
            access_token: email.user.gmailAccessToken,
            refresh_token: email.user.gmailRefreshToken,
          });
          
          await gmailService.sendEmail(email.to, email.subject, email.body);
          await db.updateScheduledEmailStatus(email.id, 'sent');
          console.log(`Email ${email.id} sent successfully.`);
        } catch (error) {
          console.error(`Failed to send email ${email.id}:`, error);
          await db.updateScheduledEmailStatus(email.id, 'failed');
        }
      }
    } catch (error) {
      console.error('Error fetching scheduled emails:', error);
    }
  });
};
```

## API Endpoints

We will create the following API endpoints to manage scheduled emails:

### `POST /api/gmail/schedule`

Schedules a new email to be sent at a later time.

**Request Body:**

```json
{
  "to": "john.doe@example.com",
  "subject": "Meeting Tomorrow",
  "body": "<p>Hi John,...</p>",
  "scheduled_at": "2025-07-11T10:00:00Z"
}
```

**Response:**

```json
{
  "id": 1,
  "to": "john.doe@example.com",
  "subject": "Meeting Tomorrow",
  "scheduled_at": "2025-07-11T10:00:00Z",
  "status": "pending"
}
```

### `PUT /api/gmail/schedule/:id`

Updates a scheduled email.

**Request Body:**

```json
{
  "to": "john.doe@example.com",
  "subject": "Meeting Tomorrow",
  "body": "<p>Hi John,...</p>",
  "scheduled_at": "2025-07-11T11:00:00Z"
}
```

**Response:**

```json
{
  "id": 1,
  "to": "john.doe@example.com",
  "subject": "Meeting Tomorrow",
  "scheduled_at": "2025-07-11T11:00:00Z",
  "status": "pending"
}
```

### `DELETE /api/gmail/schedule/:id`

Deletes a scheduled email.

**Response:**

```json
{
  "success": true
}
```
