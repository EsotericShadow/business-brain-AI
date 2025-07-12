import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GmailService } from '../gmailService';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

// Mock the googleapis library
jest.mock('googleapis', () => {
    const mockMessages = {
        send: jest.fn(),
        get: jest.fn(),
        modify: jest.fn(),
    };
    const mockDrafts = {
        create: jest.fn(),
        update: jest.fn(),
        send: jest.fn(),
    };
    const mockGmail = {
        users: {
            messages: mockMessages,
            drafts: mockDrafts,
        },
    };
    return {
        google: {
            gmail: jest.fn(() => mockGmail),
        },
    };
});

describe('GmailService', () => {
    let gmailService: GmailService;
    let mockAuth: OAuth2Client;
    let mockGmail: any;

    beforeEach(() => {
        mockAuth = new OAuth2Client();
        gmailService = new GmailService(mockAuth);
        // This is a bit of a hack to get the mocked instance
        mockGmail = google.gmail();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('sends an email with the correct parameters', async () => {
        const mockSend = mockGmail.users.messages.send;
        mockSend.mockResolvedValue({
            data: { id: 'test-message-id-123' },
        });

        const to = ['test@example.com'];
        const subject = 'Test Subject';
        const body = '<p>Test Body</p>';

        const messageId = await gmailService.sendEmail(to, subject, body);

        expect(messageId).toBe('test-message-id-123');
        expect(mockSend).toHaveBeenCalledTimes(1);
        
        const sentMessage = mockSend.mock.calls[0][0];
        expect(sentMessage.userId).toBe('me');

        const raw = Buffer.from(sentMessage.requestBody.raw, 'base64').toString();
        expect(raw).toContain(`To: ${to.join(', ')}`);
        expect(raw).toContain(`Subject: ${subject}`);
        expect(raw).toContain(body);
    });

    it('archives an email by removing the INBOX label', async () => {
        const mockModify = mockGmail.users.messages.modify;
        const emailId = 'test-email-id-456';

        await gmailService.archiveEmail(emailId);

        expect(mockModify).toHaveBeenCalledTimes(1);
        expect(mockModify).toHaveBeenCalledWith({
            userId: 'me',
            id: emailId,
            requestBody: {
                removeLabelIds: ['INBOX'],
            },
        });
    });
});
