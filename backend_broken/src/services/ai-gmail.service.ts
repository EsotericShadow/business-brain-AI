import { google } from 'googleapis';
import { GmailAuthService } from './gmail-auth.service';
import { config } from '../config/environment';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIGmailService {
  private gmail: any;
  private authService: GmailAuthService;
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(userId: string) {
    this.authService = new GmailAuthService(userId);
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
        model: config.AI_MODEL,
        tools: [{ functionDeclarations: this.getFunctionDefinitions() }],
    });
  }

  private async initializeGmailClient(): Promise<void> {
    const accessToken = await this.authService.getValidAccessToken();
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  // AI Function Definitions
  getFunctionDefinitions() {
    return [
      {
        name: 'list_emails',
        description: 'List emails from Gmail inbox with optional filters',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Gmail search query (e.g., "from:john@example.com", "is:unread")'
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of emails to return (default: 10)'
            },
            labelIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of label IDs to filter by'
            }
          }
        }
      },
      {
        name: 'get_email_content',
        description: 'Get the full content of a specific email',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The ID of the email message to retrieve'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'send_email',
        description: 'Send a new email',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            body: {
              type: 'string',
              description: 'Email body content'
            },
            cc: {
              type: 'string',
              description: 'CC recipients (optional)'
            },
            bcc: {
              type: 'string',
              description: 'BCC recipients (optional)'
            }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'mark_email_read',
        description: 'Mark an email as read',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The ID of the email message to mark as read'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'mark_email_unread',
        description: 'Mark an email as unread',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The ID of the email message to mark as unread'
            }
          },
          required: ['messageId']
        }
      },
      {
        name: 'create_email_summary',
        description: 'Create a summary of multiple emails',
        parameters: {
          type: 'object',
          properties: {
            messageIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email message IDs to summarize'
            },
            summaryType: {
              type: 'string',
              enum: ['brief', 'detailed', 'action_items'],
              description: 'Type of summary to generate'
            }
          },
          required: ['messageIds']
        }
      }
    ];
  }

  // AI Function Implementations
  async listEmails(params: {
    query?: string;
    maxResults?: number;
    labelIds?: string[];
  }) {
    await this.initializeGmailClient();

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: params.query,
        maxResults: params.maxResults || 10,
        labelIds: params.labelIds
      });

      const messages = response.data.messages || [];
      const emailList = [];

      for (const message of messages) {
        const emailData = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });

        const headers = emailData.data.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        emailList.push({
          id: message.id,
          from,
          subject,
          date,
          snippet: emailData.data.snippet,
          isRead: !emailData.data.labelIds?.includes('UNREAD')
        });
      }

      return {
        success: true,
        emails: emailList,
        totalCount: response.data.resultSizeEstimate
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to list emails: ${error.message}`
      };
    }
  }

  async getEmailContent(params: { messageId: string }) {
    await this.initializeGmailClient();

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: params.messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;
      
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract email body
      let body = '';
      if (message.payload.body.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString();
      } else if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString();
            break;
          }
        }
      }

      return {
        success: true,
        email: {
          id: params.messageId,
          from,
          to,
          subject,
          date,
          body,
          snippet: message.snippet,
          isRead: !message.labelIds?.includes('UNREAD')
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get email content: ${error.message}`
      };
    }
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }) {
    await this.initializeGmailClient();

    try {
      const email = [
        `To: ${params.to}`,
        params.cc ? `Cc: ${params.cc}` : '',
        params.bcc ? `Bcc: ${params.bcc}` : '',
        `Subject: ${params.subject}`,
        '',
        params.body
      ].filter(line => line !== '').join('\n');

      const encodedEmail = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+\$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return {
        success: true,
        messageId: response.data.id,
        message: 'Email sent successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to send email: ${error.message}`
      };
    }
  }

  async markEmailRead(params: { messageId: string }) {
    await this.initializeGmailClient();

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: params.messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      return {
        success: true,
        message: 'Email marked as read'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to mark email as read: ${error.message}`
      };
    }
  }

  async markEmailUnread(params: { messageId: string }) {
    await this.initializeGmailClient();

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: params.messageId,
        requestBody: {
          addLabelIds: ['UNREAD']
        }
      });

      return {
        success: true,
        message: 'Email marked as unread'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to mark email as unread: ${error.message}`
      };
    }
  }

  async createEmailSummary(params: {
    messageIds: string[];
    summaryType?: 'brief' | 'detailed' | 'action_items';
  }) {
    const emails = [];
    
    for (const messageId of params.messageIds) {
      const emailResult = await this.getEmailContent({ messageId });
      if (emailResult.success) {
        emails.push(emailResult.email);
      }
    }

    if (emails.length === 0) {
      return {
        success: false,
        error: 'No emails found to summarize'
      };
    }

    // Generate summary based on type
    const summaryType = params.summaryType || 'brief';
    let summary = '';

    switch (summaryType) {
      case 'brief':
        summary = this.generateBriefSummary(emails);
        break;
      case 'detailed':
        summary = this.generateDetailedSummary(emails);
        break;
      case 'action_items':
        summary = this.generateActionItemsSummary(emails);
        break;
    }

    return {
      success: true,
      summary,
      emailCount: emails.length,
      summaryType
    };
  }

  private generateBriefSummary(emails: any[]): string {
    const senders = [...new Set(emails.map(e => e.from))];
    const subjects = emails.map(e => e.subject);
    
    return `Summary of ${emails.length} emails from ${senders.length} sender(s): ${senders.join(', ')}. Key topics: ${subjects.slice(0, 3).join(', ')}${subjects.length > 3 ? '...' : ''}.`;
  }

  private generateDetailedSummary(emails: any[]): string {
    let summary = `Detailed Summary of ${emails.length} Emails:\n\n`;
    
    emails.forEach((email, index) => {
      summary += `${index + 1}. From: ${email.from}\n`;
      summary += `   Subject: ${email.subject}\n`;
      summary += `   Date: ${email.date}\n`;
      summary += `   Summary: ${email.snippet}\n\n`;
    });

    return summary;
  }

  private generateActionItemsSummary(emails: any[]): string {
    let summary = `Action Items from ${emails.length} Emails:\n\n`;
    
    emails.forEach((email, index) => {
      // Simple action item extraction (could be enhanced with AI)
      const actionKeywords = ['please', 'need', 'required', 'urgent', 'deadline', 'asap'];
      const hasActionItems = actionKeywords.some(keyword => 
        email.body.toLowerCase().includes(keyword) || 
        email.subject.toLowerCase().includes(keyword)
      );

      if (hasActionItems) {
        summary += `${index + 1}. ${email.subject} (from ${email.from})\n`;
        summary += `   Potential action required based on content\n\n`;
      }
    });

    return summary;
  }
}