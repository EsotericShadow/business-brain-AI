# Project Overview: Business Brain AI Assistant

**ID:** ISSUE#6
**Date:** 2025-07-10
**Status:** In Progress

---

### 1. Project Vision

Business Brain is an AI-powered assistant designed to streamline a user's digital life by integrating with essential services like Google Workspace (Gmail, Calendar, Drive) and providing a conversational interface to manage them.

The primary goal is to create a "digital co-pilot" that can understand natural language commands and perform complex actions on the user's behalf, such as:

-   Managing emails (reading, drafting, sending, searching).
-   Organizing files and documents.
-   Scheduling and managing calendar events.
-   Providing intelligent summaries and insights from the user's data.

### 2. Core Components

The application is a modern web app with two main parts:

-   **Frontend:** A React-based single-page application (SPA) that provides the user interface, including the chat window, file browser, and email client.
-   **Backend:** A Node.js/Express server that handles business logic, user authentication, and communication with third-party APIs (Google, Stripe, Gemini).

### 3. Key Features (Current & Planned)

-   **Unified Workspace:** A central dashboard to access and manage emails, files, and calendar events.
-   **Conversational AI Chat:** An input field where users can type commands for the AI assistant.
-   **Secure Authentication:** OAuth 2.0 flow for connecting Google accounts securely.
-   **Gmail Integration:** The ability to view, search, draft, and send emails.
-   **AI-Powered Actions:** Leveraging the Gemini API to understand user intent and execute actions through function calling.
-   **Subscription Management:** Stripe integration for handling user plans and token-based usage.

This collection of documents in `ISSUE#6` aims to provide full context for the ongoing development work to achieve a fully autonomous Gmail agent.
