# Bug Report: AI Chat Integration Failure

**Issue:** The AI chat feature is not working. No text is displayed, and multiple errors appear in the browser console and backend logs.

**Root Cause:** The frontend is sending the chat history to the backend in a format that is incompatible with the Google Generative AI SDK.

**Error Messages:**
- **Frontend:** `[GoogleGenerativeAI Error]: First content should be with role 'user', got undefined`
- **Frontend:** `Error fetching AI response: Error: Cannot read properties of undefined (reading 'length')`
- **Backend:** `Failed to process AI request: TypeError: Cannot read properties of undefined (reading 'length')`
- **Backend:** `Failed to process AI request: GoogleGenerativeAIError: [GoogleGenerativeAI Error]: First content should be with role 'user', got undefined`

**Analysis:**
The frontend `Workspace.tsx` component sends a `messages` array to the backend. Each object in this array has the shape `{ id, content, type: 'user' | 'ai' }`.

The backend service `ai-gmail.service.ts` receives this array and passes it directly to the Google Generative AI SDK's `startChat` method.

However, the SDK expects the history to be an array of objects with the shape `{ role: 'user' | 'model', parts: [{ text: string }] }`.

This mismatch causes the SDK to throw an error, leading to a 500 Internal Server Error response and the failure of the chat functionality.
