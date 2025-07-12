import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/environment';

// Placeholder for a secure, persistent storage service (e.g., Redis, Database)
const secureStorage = new Map<string, string>();

export class GmailAuthService {
  private oauth2Client: OAuth2Client;
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  constructor(private userId: string) {
    this.oauth2Client = new google.auth.OAuth2(
      config.GMAIL_CLIENT_ID,
      config.GMAIL_CLIENT_SECRET,
      config.GMAIL_REDIRECT_URI
    );

    // Set up token refresh handling
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.storeRefreshToken(tokens.refresh_token);
      }
      if (tokens.access_token) {
        this.storeAccessToken(tokens.access_token);
      }
    });
  }

  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      prompt: 'consent'
    });
  }

  async handleAuthCallback(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    userInfo: any;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user information
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      if (tokens.access_token) {
        this.storeAccessToken(tokens.access_token);
      }
      if (tokens.refresh_token) {
        this.storeRefreshToken(tokens.refresh_token);
      }

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        userInfo: userInfo.data
      };
    } catch (error: any) {
      console.error("Authentication callback error:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getValidAccessToken(): Promise<string> {
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      // In a real app, you'd check for expiry here before returning
      return accessToken;
    }

    const refreshToken = await this.getRefreshToken();
    if (refreshToken) {
      return await this.refreshAccessToken(refreshToken);
    }

    throw new Error('No valid authentication tokens available. Please re-authenticate.');
  }
  
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      if (credentials.access_token) {
        this.storeAccessToken(credentials.access_token);
        return credentials.access_token;
      }
      throw new Error('Failed to refresh access token.');
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // --- Storage Methods ---
  // These would interact with a persistent store in production
  private async storeAccessToken(token: string): Promise<void> {
    secureStorage.set(`access_token:${this.userId}`, token);
  }

  private async storeRefreshToken(token: string): Promise<void> {
    secureStorage.set(`refresh_token:${this.userId}`, token);
  }

  private async getAccessToken(): Promise<string | null> {
    return secureStorage.get(`access_token:${this.userId}`) || null;
  }

  private async getRefreshToken(): Promise<string | null> {
    return secureStorage.get(`refresh_token:${this.userId}`) || null;
  }
}
