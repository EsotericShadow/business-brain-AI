# Transition Plan: 04 - Frontend UX

This document outlines the frontend user experience for the "Digital Mailroom" feature, focusing on onboarding and in-app interaction.

## 1. Phase 1: The "Golden Onboarding"

The goal is to make the email forwarding workflow feel intentional and powerful from the very first moment a user interacts with the application.

### 1.1. The Welcome Email

-   **Sender:** `welcome@your-app.com` (not `no-reply@`).
-   **Call to Action:** The primary call to action will be interactive. For example: "Reply to this email to create your first note!" or "Forward this to your unique address to see the magic happen." This teaches the core mechanic through action.

### 1.2. The "Setup Your Mailroom" Wizard

This will be a one-time, guided setup process presented to the user upon their first login.

-   **Step 1: Present the Address**
    -   The UI will clearly display the user's unique, private address (e.g., `dave@project-alpha.your-app-domain.com`).
    -   A **"Add to Contacts"** button will be prominently displayed. Clicking this will download a `.vcf` (vCard) file, allowing the user to add the address to their contacts with a single click.

-   **Step 2: Interactive Test**
    -   The UI will prompt the user: "Send any email to that address right now. We'll wait here."
    -   The frontend will display a "listening..." or loading state.
    -   It will poll a new backend endpoint (e.g., `GET /api/emails/latest`) or use a WebSocket to listen for the new email.
    -   As soon as the forwarded email is received by the backend, the UI will instantly update to a success state: "Success! We got it. Here's your email, ready for our AI." This immediate feedback is crucial.

-   **Step 3: Teach Automation**
    -   The wizard will show how to set up auto-forwarding filters.
    -   A dropdown menu will allow the user to select their email client (Gmail, Outlook, etc.).
    -   Based on the selection, the UI will display a simple, visual guide with copy-and-paste instructions for creating a filter in that specific client.

## 2. Phase 2: In-App Features

Once emails are ingested, the application will provide a rich interface for interacting with them.

### 2.1. New "Mailroom" Tab

-   A new tab, labeled "Mailroom" or "Ingested Emails," will be added to the main workspace view (`Workspace.tsx`).
-   This view will list all emails that have been forwarded to the user's unique address.
-   It will have a similar two-panel layout to the existing `EmailView.tsx`, with a list of emails on the left and the content of the selected email on the right.

### 2.2. Smart AI Interactions

-   When viewing an ingested email, the AI prompt bar will be pre-filled with contextual suggestions:
    -   "Summarize this email thread."
    -   "Extract action items from this email."
    -   "Draft a reply to [Sender Name]."

### 2.3. Seamless "Smart Reply" Flow

-   When the user asks the AI to draft a reply, the generated text will appear in the chat window.
-   Crucially, alongside the draft, there will be two buttons:
    1.  **"Copy for Email":** Copies the generated text to the clipboard.
    2.  **"Open in Email Client":** This will be a `mailto:` link that, when clicked, opens the user's default email client with the `to`, `subject` (pre-filled with `Re: [Original Subject]`), and the AI-generated `body` all pre-populated.

This flow avoids the need for the app to have "send mail as" permissions and keeps the user in control, using their own trusted email client to send the final message.
