# Proposed Solution

The problem can be fixed by transforming the chat history on the frontend before it is sent to the backend.

**File to Modify:** `frontend/src/Workspace.tsx`

**Function to Modify:** `handleSendMessage`

**Change:**
Before making the `api.post` call, the `messages` array from the `useMessageStore` should be mapped to the format expected by the Google Generative AI SDK.

**Current (Incorrect) Code:**
```typescript
// frontend/src/Workspace.tsx

const handleSendMessage = useCallback(async (inputText: string) => {
    // ...
    try {
      const response = await api.post('/api/gmail/ai', { prompt: inputText, history: messages });
      // ...
    } catch (error: any) {
      // ...
    } finally {
      // ...
    }
  }, [isLoading, addMessage, messages, onUpdateUser]);
```

**Proposed (Corrected) Code:**
```typescript
// frontend/src/Workspace.tsx

const handleSendMessage = useCallback(async (inputText: string) => {
    // ...
    try {
      const historyForApi = messages.map(msg => ({
        role: msg.type === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await api.post('/api/gmail/ai', { prompt: inputText, history: historyForApi });
      // ...
    } catch (error: any) {
      // ...
    } finally {
      // ...
    }
  }, [isLoading, addMessage, messages, onUpdateUser]);
```

This change ensures that the backend receives the chat history in the correct format (`{ role: 'user' | 'model', parts: [{ text: string }] }`), which will resolve the `[GoogleGenerativeAI Error]` and allow the chat to function as expected. No backend changes are required.
