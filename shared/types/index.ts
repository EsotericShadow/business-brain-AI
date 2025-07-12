// --- Core User and Auth Types ---
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    gmailAccessToken?: string | null;
    gmailRefreshToken?: string | null;
    stripeCustomerId?: string;
    planId?: 'free' | 'freelancer' | 'business';
    tokenBalance?: number;
    trialEndsAt?: string;
}

// --- Billing and Subscription Types ---
export interface Plan {
    id: 'free' | 'freelancer' | 'business';
    name: string;
    price: number;
    pricePeriod: 'mo' | 'yr';
    tokens: number;
    features: string[];
}

export interface TokenPack {
    id: number;
    name: string;
    price: number;
    tokens: number;
}

// --- Chat and AI Interaction Types ---
export interface Chat {
    id: string;
    title: string;
    messages: Message[];
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  // content can be complex, e.g. a list of emails, a file, etc.
  content?: any; 
}

// --- Gmail Integration Types ---
export interface Email {
    id: string;
    sender: string;
    subject: string;
    snippet: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

export interface EmailDraft {
  id: string;
  to: string;
  subject: string;
  body: string;
}

// --- Workspace and File System Types ---
export type ItemId = string;

export interface DirectoryItem {
    id: ItemId;
    name: string;
    type: 'directory' | 'spreadsheet' | 'document';
    parentId: ItemId;
    children?: ItemId[]; // Only for directories
    isVisible?: boolean; // For files
    content?: any; // For files
}

export interface DirectoryNode extends DirectoryItem {
    type: 'directory';
    children: ItemId[];
}

export interface FileItem extends DirectoryItem {
    type: 'document' | 'spreadsheet';
    isVisible: boolean;
    content: any;
}

export interface SpreadsheetFile extends FileItem {
    type: 'spreadsheet';
    content: string[][];
}

// --- Media and Calendar Types (for future use) ---
export interface MediaItem {
    id: string;
    name:string;
    type: 'image' | 'video';
    url: string;
    size: string;
    createdAt: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    attendees: string[];
}

// --- UI State Types ---
export type AppTab = 'directory' | 'email' | 'calendar' | 'media';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
