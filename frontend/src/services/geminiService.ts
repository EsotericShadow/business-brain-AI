import { api } from './api';

import { api } from './api';

interface ChatResponse {
  data: {
    responseText: string;
  };
}

interface GmailActionResponse {
  data: unknown;
}

export const runChat = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    const response: ChatResponse = await api.post('/api/gemini/chat', { prompt });
    return response.data.responseText;
  } catch (error) {
    console.error("API call to /api/gemini/chat failed:", error);
    // Rethrow the error message from the backend if available
    throw new Error((error as { responseText?: string })?.responseText || (error as Error).message || "I'm having trouble connecting to my services right now. Please try again.");
  }
};

export const runGmailAction = async (prompt: string): Promise<unknown> => {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    const response: GmailActionResponse = await api.post('/api/gmail/ai', { prompt });
    return response.data;
  } catch (error) {
    console.error("API call to /api/gmail/ai failed:", error);
    // Rethrow the error message from the backend if available
    throw new Error((error as { responseText?: string })?.responseText || (error as Error).message || "I'm having trouble connecting to my services right now. Please try again.");
  }
};
