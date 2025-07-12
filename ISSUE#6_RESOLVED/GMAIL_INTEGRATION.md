# Gmail Integration and AI Agent Functionality

This document details the intended functionality of the Gmail integration and the role of the AI agent in managing a user's email.

---

### 1. Core Goal: A Fully Autonomous Gmail Agent

The ultimate vision is to create an AI agent that can manage a user's Gmail account based on high-level natural language commands. The user should not need to know specific search queries or API calls. The agent should be able to perform any action a human user could.

**Examples of Target Commands:**
-   "Draft an email to jane@example.com saying I'll be late for the meeting."
-   "Find the email from John Doe about the Q3 report and tell me the key takeaways."
-   "Are there any urgent emails from my boss?"
-   "Send a follow-up to the client from last week's meeting."
-   "Archive all emails older than one month that aren't starred."

### 2. Technical Implementation via Function Calling

To achieve this, the backend uses the Google Gemini API with **function calling**.

1.  **User Prompt:** The user enters a command in the chat interface (e.g., "draft an email...").
2.  **Backend Request:** The prompt is sent to the `/api/gmail/ai` endpoint.
3.  **Gemini API Call:** The backend sends the prompt to the Gemini model, along with a list of available "tools" (functions) that the model can ask to call.
4.  **Function Call Request:** The Gemini model analyzes the prompt and, instead of just returning text, returns a structured JSON object requesting a function to be called with specific arguments.
    -   For "draft an email to test@example.com about lunch," the model would return a request to call the `createDraft` function with `to: 'test@example.com'` and `subject: 'Lunch'`.
5.  **Backend Execution:**
    -   The backend parses the function call request from the Gemini response.
    -   It then uses the `GmailService` to execute the requested action (e.g., call the Gmail API to create a draft).
6.  **Response to User:** The backend sends a confirmation back to the frontend, which can then display the result (e.g., show the newly created draft).

### 3. Available Gmail Functions (Tools)

The `backend/src/routes/gmail.ts` file defines the functions available to the Gemini model. Currently, these include:

-   `createDraft(to, subject, body)`: Creates a new draft email.
-   `searchEmails(query)`: Searches the user's emails.

**Future functions to be added:**
-   `sendEmail(to, subject, body)`
-   `getEmail(emailId)`
-   `updateDraft(draftId, to, subject, body)`
-   `sendDraft(draftId)`
-   `archiveEmail(emailId)`
-   `starEmail(emailId)`
-   `getThread(threadId)`
-   `summarizeThread(threadId)`

By expanding this set of tools, the AI agent's capabilities can be progressively enhanced to cover the full range of Gmail actions.
