# Transition Plan: 00 - Executive Summary & Roadmap

This document provides a high-level overview of the strategic initiative to refactor the application into a provider-agnostic platform. The goal is to reduce vendor lock-in, increase resilience, and provide greater flexibility for future development.

This transition is broken down into three core pillars, each with its own detailed architectural blueprint.

---

## 1. Pillar 1: Decoupling Email (The Digital Mailroom)

-   **Problem:** The application functions as a direct client for a user's Gmail account, creating a hard dependency on Google's ecosystem and APIs.
-   **Solution:** We will pivot to a "Digital Mailroom" model. Instead of connecting to a user's inbox, we will provide each user with a unique, private email address. Users can then forward important emails to this address, turning their email content into a data source for our application.
-   **Benefits:** This is the most critical step towards provider agnosticism. It completely removes the dependency on the Gmail API and allows us to build features on a stable, internal data model.
-   **Detailed Plans:**
    -   `01_DATABASE_CHANGES.md`
    -   `02_BACKEND_API.md`
    -   `03_EMAIL_INGESTION_SERVICE.md`
    -   `04_FRONTEND_UX.md`

---

## 2. Pillar 2: Generalizing Authentication

-   **Problem:** User identity is currently managed exclusively through Google OAuth, tying the user model directly to a Google account `sub` (subject ID).
-   **Solution:** We will replace the Google-specific login with a provider-agnostic, passwordless "magic link" system. This involves decoupling our internal `User` ID from Google's identifiers and implementing a secure, email-based verification flow.
-   **Benefits:** This allows users to sign up and log in with any email address, significantly broadening our potential user base and removing a key dependency on Google's identity services.
-   **Detailed Plan:**
    -   `05_PROVIDER_AGNOSTIC_AUTH.md`

---

## 3. Pillar 3: Abstracting AI Services

-   **Problem:** The backend code is directly integrated with the `@google/generative-ai` library, making it difficult to switch to or experiment with other AI models.
-   **Solution:** We will introduce an AI abstraction layer. A new, generic `AIService` will define a standard internal format for AI requests and responses. All parts of the application will interact with this service. Provider-specific logic (for Google Gemini, and potentially OpenAI or Anthropic in the future) will be encapsulated in separate "provider" classes that translate between our internal format and the external APIs.
-   **Benefits:** This makes our AI backend highly modular. We can switch or even combine different AI providers by only changing the code within the `AIService`, requiring no changes to the rest of the application.
-   **Detailed Plan:**
    -   `06_AI_SERVICE_ABSTRACTION.md`

---

## Implementation Roadmap

This transition should be executed in the order outlined above:

1.  **Email Decoupling:** This is the highest priority as it is the most significant architectural change and delivers the most value in terms of provider independence.
2.  **Authentication Generalization:** This should follow the email work, as it further liberates our user model from Google's ecosystem.
3.  **AI Abstraction:** This can be implemented last, as it provides long-term flexibility but is less critical than the foundational user data and email changes.
