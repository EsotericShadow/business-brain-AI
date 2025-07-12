// Relevant snippet from frontend/src/Workspace.tsx

// --- CHAT HANDLERS ---
const handleSendMessage = useCallback(async (inputText: string) => {
if (!inputText.trim() || isLoading) return;

const userMessage: Message = { id: Date.now().toString(), content: inputText, type: 'user' };
addMessage(userMessage);
setIsLoading(true);

try {
    const response = await api.post('/api/gmail/ai', { prompt: inputText, history: messages });
    const { type, data, content } = response.data;

    // Add a simple text confirmation to the chat
    const aiConfirmation: Message = { id: (Date.now() + 1).toString(), content: content || `Action ${type} completed.`, type: 'ai' };
    addMessage(aiConfirmation);

    // ... (rest of the function)
} catch (error: any) {
    const errorMessageText = error.message || 'An unknown error occurred.';
    console.error('Error fetching AI response:', error);
    const errorMessage: Message = { id: (Date.now() + 1).toString(), content: errorMessageText, type: 'ai' };
    addMessage(errorMessage);
    addToast(errorMessageText, 'error');
} finally {
    setIsLoading(false);
}
}, [isLoading, addMessage, messages, onUpdateUser]);
