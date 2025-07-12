# New Developer Onboarding Guide

Welcome to the Business Brain AI Assistant project! This guide is your starting point for understanding the architecture, setting up your development environment, and getting ready to contribute.

It is designed to be read in order and provides links to the more detailed documentation you'll need.

---

## 1. Project Overview

First, get a high-level understanding of the project's goals, features, and architecture. This will provide the context for everything else you do.

*   **Action:** Read the main project `README.md`.
*   **Location:** `../README.md`

The `README.md` covers the core features, the technical stack, and the step-by-step instructions for getting the application running locally. **Please complete the setup instructions in the README before proceeding.**

---

## 2. Key Architectural Concepts

Before diving into the specific reference guides, it's important to understand the two core provider-agnostic patterns that define this application.

### The "Digital Mailroom" (Email Ingestion)

The application does **not** connect directly to a user's email account. Instead, it uses a forwarding-based model:

1.  **Private Address:** Upon signup, each user gets one or more unique, private email addresses (e.g., `alias@mail.your-app.com`).
2.  **Forwarding:** The user sets up rules in their own email client (Gmail, Outlook, etc.) to automatically forward important emails to their private address.
3.  **Ingestion:** Our backend receives these forwarded emails via a webhook from a transactional email service (like Mailgun or SendGrid). The emails are then parsed and stored in our own database.

This architecture completely decouples us from any specific email provider.

### Passwordless Authentication (Magic Links)

User authentication is handled by a secure, passwordless system.

1.  **Request:** A user enters their email address to log in.
2.  **Email:** The backend sends them an email with a unique, single-use "magic link."
3.  **Verification:** The user clicks the link, which hits a verification endpoint on our backend.
4.  **Session:** If the link's token is valid, the backend destroys the token, creates a standard session JWT, and logs the user in.

This system is highly secure and avoids the need for us to store user passwords.

---

## 3. Deep Dive Reference Guides

As you begin working on features, you will need to consult the detailed reference documentation.

*   **API Reference:** For understanding all backend endpoints.
    *   **Location:** `API_REFERENCE.md`

*   **Component Guide:** For understanding the key React components on the frontend.
    *   **Location:** `COMPONENT_GUIDE.md`

*   **Data Model Guide:** For understanding the database schema and the shape of data as it moves through the application.
    *   **Location:** `DATA_MODELS.md`

---

## 4. Development Workflow

1.  **Get the latest code:** `git pull`
2.  **Run the database:** `docker start business-brain-db`
3.  **Start the backend:** Open a terminal, `cd backend`, and run `npm run dev`.
4.  **Start the frontend:** Open a second terminal, `cd frontend`, and run `npm run dev`.
5.  **Log In:** Use the magic link flow to log in. The link will be printed in your backend terminal.
6.  **Code!**
7.  **Before committing:** Run any linting or testing scripts.

Welcome to the team!