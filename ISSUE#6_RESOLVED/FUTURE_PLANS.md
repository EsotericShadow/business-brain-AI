# Future Plans & Next Steps

This document outlines the immediate next steps for development and the long-term vision for the Business Brain AI Assistant.

---

### 1. Immediate Goal: A Robust Gmail Agent

The current priority is to build out the full suite of Gmail capabilities for the AI agent. This involves two main tasks:

**A. Expanding the AI's Toolkit:**
The set of functions available to the Gemini model needs to be completed. The following functions must be implemented in `backend/src/services/gmailService.ts` and exposed as tools in `backend/src/routes/gmail.ts`:

-   [ ] `sendEmail`
-   [ ] `getEmail` (to read the content of a specific email)
-   [ ] `updateDraft`
-   [ ] `sendDraft`
-   [ ] `archiveEmail`
-   [ ] `starEmail`
-   [ ] `getThread`
-   [ ] `summarizeThread` (This may involve a second call to the Gemini API)
-   [ ] `listLabels`
-   [ ] `applyLabel` / `removeLabel`

**B. Improving Frontend UI/UX:**
The frontend needs to be enhanced to handle the new AI capabilities gracefully.

-   [ ] **Display Different Response Types:** The `ChatWindow` must be able to render not just text, but also email drafts, lists of emails, and other structured data returned by the AI.
-   [ ] **Confirmation Steps:** For destructive actions like sending an email or deleting a draft, the UI should present a confirmation step to the user before the action is executed.
-   [ ] **Loading & Error States:** Implement more robust loading indicators and user-friendly error messages.
-   [ ] **Onboarding:** Create a simple onboarding flow that explains what the user can do and ensures they have connected their Gmail account.

### 2. Long-Term Vision

Beyond Gmail, the vision is to create a comprehensive digital assistant.

-   **Google Calendar Integration:**
    -   "Schedule a meeting with Jane for tomorrow at 2 PM."
    -   "What's on my calendar for today?"
    -   "Move my 3 PM meeting to 4 PM."

-   **Google Drive Integration:**
    -   "Find my presentation from last quarter."
    -   "Summarize the document 'Project Phoenix Proposal'."
    -   "Share this file with my team."

-   **Proactive Assistance:**
    -   The agent could proactively identify scheduling conflicts, suggest email follow-ups, or summarize important documents before a meeting.

-   **Multi-Platform Support:**
    -   While currently a web app, the architecture could support a mobile app or desktop client in the future.

By methodically building out the toolset and improving the user interface, Business Brain can evolve from a promising prototype into an indispensable AI assistant.
