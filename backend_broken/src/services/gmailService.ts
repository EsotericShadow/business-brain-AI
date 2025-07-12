import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  date: Date;
  labels: string[];
}

export class GmailService {
  private gmail: gmail_v1.Gmail;

  constructor(private auth: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  private createEmailMessage(to: string[], subject: string, body: string): string {
    const emailLines = [
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ];
    const message = emailLines.join('\r\n');
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private parseEmailMessage(message: gmail_v1.Schema$Message): EmailMessage {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
    
    let body = '';
    if (message.payload?.parts) {
        const part = message.payload.parts.find(p => p.mimeType === 'text/html');
        if (part?.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
    } else if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    return {
      id: message.id!,
      threadId: message.threadId!,
      subject: getHeader('subject'),
      from: getHeader('from'),
      to: getHeader('to').split(',').map(email => email.trim()),
      body: body,
      date: new Date(parseInt(message.internalDate || '0')),
      labels: message.labelIds || [],
    };
  }

  async getEmail(emailId: string): Promise<EmailMessage> {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full',
    });
    return this.parseEmailMessage(response.data);
  }

  async sendEmail(to: string[], subject: string, body: string): Promise<string> {
    const message = this.createEmailMessage(to, subject, body);
    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: message },
    });
    return response.data.id || '';
  }

  async createDraft(to: string[], subject: string, body: string): Promise<gmail_v1.Schema$Draft> {
    const message = this.createEmailMessage(to, subject, body);
    const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
            message: {
                raw: message
            }
        }
    });
    return response.data;
  }

  async updateDraft(draftId: string, to: string[], subject: string, body: string): Promise<gmail_v1.Schema$Draft> {
    const message = this.createEmailMessage(to, subject, body);
    const response = await this.gmail.users.drafts.update({
        userId: 'me',
        id: draftId,
        requestBody: {
            message: {
                raw: message
            }
        }
    });
    return response.data;
  }

  async sendDraft(draftId: string): Promise<string> {
      const response = await this.gmail.users.drafts.send({
          userId: 'me',
          requestBody: {
              id: draftId
          }
      });
      return response.data.id || '';
  }

  async archiveEmail(emailId: string): Promise<void> {
      await this.gmail.users.messages.modify({
          userId: 'me',
          id: emailId,
          requestBody: {
              removeLabelIds: ['INBOX']
          }
      });
  }
}