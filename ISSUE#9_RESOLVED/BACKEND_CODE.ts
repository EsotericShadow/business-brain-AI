// Relevant snippet from backend/src/routes/gmail.ts
router.post('/ai', verifyJwt, async (req, res) => {
    try {
        const { prompt, history } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const aiGmailService = new AIGmailService(userId);
        const responseData = await aiGmailService.processUserRequest(prompt, history);
        
        // Always wrap the response in a 'data' object for consistency
        res.json({ data: responseData });
    } catch (error: any) {
        console.error('Failed to process AI request:', error);
        res.status(500).json({ error: 'Failed to process AI request', details: error.message });
    }
});


// Relevant snippet from backend/src/services/ai-gmail.service.ts
export class AIGmailService {
  // ... (constructor and other methods)

  async processUserRequest(prompt: string, history: any[] = []) {
    const chat = this.model.startChat({ history });
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    if (response.functionCalls && response.functionCalls().length > 0) {
      const functionCall = response.functionCalls()[0];
      return this.executeFunctionCall(functionCall);
    }
    return { type: "text", content: response.text() };
  }

  // ... (rest of the class)
}
