import { GoogleGenerativeAI } from '@google/generative-ai';
import { GmailService } from './gmailService';
import { config } from '../config/environment';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private gmailService: GmailService) {
    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: [{ functionDeclarations: this.getFunctionDeclarations() }],
    });
  }

  async processUserRequest(prompt: string, history: any[] = []): Promise<any> {
    const chat = this.model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    if (response.functionCalls && response.functionCalls().length > 0) {
      const functionCall = response.functionCalls()[0];
      return this.executeFunctionCall(functionCall);
    }
    return { type: 'text', content: response.text() };
  }

  private async executeFunctionCall({ name, args }: { name: string, args: any }) {
    try {
      let result;
      switch (name) {
        case 'sendEmail':
          result = await this.gmailService.sendEmail(args.to, args.subject, args.body);
          return { type: 'confirmation', content: `Email sent successfully with ID: ${result}` };
        
        case 'createDraft':
          result = await this.gmailService.createDraft(args.to, args.subject, args.body);
          return { type: 'draftCreated', content: `Draft created with ID: ${result.id}`, data: result };

        case 'updateDraft':
            result = await this.gmailService.updateDraft(args.draftId, args.to, args.subject, args.body);
            return { type: 'draftUpdated', content: `Draft ${args.draftId} updated successfully.`, data: result };

        case 'sendDraft':
            result = await this.gmailService.sendDraft(args.draftId);
            return { type: 'confirmation', content: `Draft sent successfully. New message ID: ${result}` };

        case 'archiveEmail':
            await this.gmailService.archiveEmail(args.emailId);
            return { type: 'confirmation', content: `Email ${args.emailId} archived.` };

        default:
          console.warn(`Unknown function call: ${name}`);
          return { type: 'error', content: `Function ${name} is not implemented.` };
      }
    } catch (error: any) {
        console.error(`Error executing function ${name}:`, error);
        return { type: 'error', content: `Error executing function ${name}: ${error.message}` };
    }
  }

  private getFunctionDeclarations() {
    return [
      {
        name: 'sendEmail',
        description: 'Send an email to one or more recipients.',
        parameters: {
          type: 'object',
          properties: {
            to: { type: 'array', items: { type: 'string' }, description: 'The email addresses of the recipients.' },
            subject: { type: 'string', description: 'The subject of the email.' },
            body: { type: 'string', description: 'The HTML body of the email.' },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      {
        name: 'createDraft',
        description: 'Create a new draft email.',
        parameters: {
            type: 'object',
            properties: {
                to: { type: 'array', items: { type: 'string' }, description: 'The email addresses of the recipients.' },
                subject: { type: 'string', description: 'The subject of the email.' },
                body: { type: 'string', description: 'The HTML body of the email.' },
            },
            required: ['to', 'subject', 'body'],
        },
      },
      {
          name: 'updateDraft',
          description: 'Update an existing draft email.',
          parameters: {
              type: 'object',
              properties: {
                  draftId: { type: 'string', description: 'The ID of the draft to update.' },
                  to: { type: 'array', items: { type: 'string' }, description: 'The updated email addresses of the recipients.' },
                  subject: { type: 'string', description: 'The updated subject of the email.' },
                  body: { type: 'string', description: 'The updated HTML body of the email.' },
              },
              required: ['draftId', 'to', 'subject', 'body'],
          },
      },
      {
          name: 'sendDraft',
          description: 'Send an existing draft email.',
          parameters: {
              type: 'object',
              properties: {
                  draftId: { type: 'string', description: 'The ID of the draft to send.' },
              },
              required: ['draftId'],
          },
      },
      {
          name: 'archiveEmail',
          description: 'Move an email to the archive.',
          parameters: {
              type: 'object',
              properties: {
                  emailId: { type: 'string', description: 'The ID of the email to archive.' },
              },
              required: ['emailId'],
          },
      },
    ];
  }
}
