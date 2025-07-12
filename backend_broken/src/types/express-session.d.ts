import 'express-session';

declare module 'express-session' {
  interface SessionData {
    gmailTokens: any; // You can define a more specific type for tokens
  }
}
