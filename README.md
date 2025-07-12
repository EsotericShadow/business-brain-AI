# Business Brain AI Assistant

Business Brain is a comprehensive, full-stack AI-powered workspace designed to integrate seamlessly with your Google account. It features a sophisticated chat interface, a production-quality email client, a virtual file directory, a media viewer, and a calendar, all wrapped in a sleek, modern, and fully responsive user interface.

![image](https://github.com/user-attachments/assets/e137271c-a6c1-4a31-97f1-3294b827d13a)

---

## Core Features

*   **AI Chat Interface**: A powerful chat window powered by the Gemini API for intelligent assistance.
*   **Resizable Layout**: A draggable handle allows you to dynamically resize the chat and workspace panels to your preference.
*   **Production-Quality Email Client**:
    *   Connects directly to your Gmail account via Google OAuth.
    *   Fetches and displays emails in a clean, modern interface.
    *   Renders complex HTML emails safely using `DOMPurify`.
    *   Fully responsive, collapsible, and mobile-friendly design.
*   **Virtual Directory**:
    *   A complete file manager for creating, deleting, copying, cutting, and pasting virtual documents and spreadsheets.
    *   Toggle file visibility to control which files the AI can access.
    *   Download files, including converting spreadsheet data to CSV.
*   **Integrated Workspace Tabs**:
    *   **Directory**: The virtual file manager.
    *   **Emails**: The full-featured email client.
    *   **Media**: A gallery for your images and videos.
    *   **Calendar**: A view for your upcoming events.
*   **Secure Authentication**: Robust and secure user authentication handled via Google OAuth 2.0, with JWTs for session management.
*   **Dark Mode**: A beautiful, easy-on-the-eyes dark theme that can be set manually or follow your system preference.
*   **Billing & Subscriptions**: Integrated pricing page and checkout flow powered by Stripe.

---

## AI Capabilities & Function Calling

The application features a sophisticated, dual-AI architecture to handle a wide range of tasks. The frontend intelligently routes user prompts to the appropriate backend service based on keywords.

### 1. General Conversational AI (`/api/gemini/chat`)
For general queries, the application uses a standard conversational AI powered by the Gemini API. This endpoint is responsible for answering questions, providing information, and handling any request that doesn't involve specific Gmail actions.

### 2. Specialized Gmail Agent (`/api/gmail/ai`)
For tasks related to Gmail, the application uses a specialized agent that leverages the Gemini API's function calling capabilities. This allows the AI to use a suite of tools to perform complex actions on your behalf in response to natural language prompts.

**Key Features of the Gmail Agent:**
*   **Collaborative Draft Editing**: Create a draft and then have the AI iteratively update it. The draft is a persistent, editable object in the UI that both you and the AI can modify.
*   **Tool-Based Actions**: The AI can use a variety of tools to manage your email.

**Available Tools/Functions:**
*   **`list_emails`**: Find and display emails from your inbox. You can apply filters such as `from:user@example.com` or `is:unread`.
*   **`get_email_content`**: Get the full content of a specific email.
*   **`create_draft`**: Create a new email draft.
*   **`update_draft`**: Modify the recipient, subject, or body of an existing draft.
*   **`send_draft`**: Send a draft that has already been created and approved.
*   **`create_email_summary`**: Generate brief, detailed, or action-item-focused summaries of one or more emails.
*   **`mark_email_read` / `mark_email_unread`**: Manage the read status of your emails.

---

## Technical Architecture & Codebase Guide

This project is organized into a monorepo-like structure with three main directories: `frontend`, `backend`, and `shared`.

### Root Directory

The root directory contains configuration for the Vite development server.
*   `vite.config.ts`: Configures the development server, notably setting up a proxy to forward requests from `/api` on the frontend (`localhost:5173`) to the backend server (`localhost:8000`).
*   `package.json`: Contains dependencies for the root-level dev environment. Note that the `frontend` and `backend` directories have their own separate `package.json` files.

### `shared/`

This directory contains TypeScript types and utility functions that are used by both the frontend and backend to ensure consistency.
*   `types/index.ts`: Defines all shared data structures, such as `User`, `Message`, `Email`, and `DirectoryItem`.
*   `utils/directoryUtils.ts`: Contains the business logic for all virtual directory operations (create, delete, paste, etc.).
*   `utils/initialData.ts`: Provides mock data for development, including initial directory structures, emails, and user plans.

### `backend/`

Contains the Node.js/Express server that acts as a secure API gateway and handles all business logic.
*   `src/index.ts`: The main entry point for the backend server. It initializes middleware (CORS, Helmet, cookie-parser), sets up API routes, and starts the Express server.
*   `src/db.ts`: Initializes and exports the Prisma client for database access.
*   `prisma/schema.prisma`: Defines the PostgreSQL database schema for the `User` model, which stores user info, Google API tokens, and Stripe customer data.
*   `src/middleware/auth.ts`: Contains the `verifyJwt` middleware, which protects routes by validating the JWT sent in the `Authorization` header.
*   `src/services/`: Contains the core business logic.
    *   `gmail-auth.service.ts`: Manages the entire Google OAuth 2.0 flow, including generating auth URLs, handling callbacks, and refreshing tokens.
    *   `ai-gmail.service.ts`: The specialized Gmail agent. It integrates with the Gemini API and defines the function calling tools (`create_draft`, `update_draft`, etc.).
*   `src/routes/`: Defines the API endpoints.
    *   `gmail.ts`: Contains routes for all Gmail-related actions (`/api/gmail/ai`).
    *   `gemini.ts`: Contains the route for the general-purpose conversational AI (`/api/gemini/chat`).

### `frontend/`

Contains the React application built with Vite. This is the user-facing client.
*   `src/App.tsx`: The root component of the React application. It manages routing (`react-router-dom`) and handles the top-level user authentication state.
*   `src/Workspace.tsx`: The main, authenticated view of the application. It orchestrates all the major UI components and contains the core chat logic, including dynamically routing prompts to the correct backend AI service.
*   `src/services/api.ts`: A simple but crucial service that centralizes all `fetch` requests to the backend, automatically attaching the JWT auth token to headers.
*   `src/stores/messageStore.ts`: A Zustand store for managing the state of the chat messages. It includes logic for both adding and updating messages to support collaborative draft editing.
*   `src/pages/`: Contains the top-level page components.
    *   `HomePage.tsx`: The public-facing landing page for unauthenticated users.
    *   `AuthCallbackPage.tsx`: The page the user is redirected to after the Google OAuth flow. It receives the JWT from the URL, stores it, and redirects the user to the main workspace.
*   `src/components/`: Contains all reusable UI components.
    *   `Sidebar.tsx`: The main navigation sidebar, which includes chat history and the settings menu.
    *   `ChatWindow.tsx`: The core chat interface where users interact with the AI. It dynamically renders standard text messages or interactive components like the `DraftEditor`.
    *   `DraftEditor.tsx`: A fully editable form for composing and modifying email drafts.
    *   `EmailView.tsx`: A complete, self-contained email client component. It has been recently updated with more reliable data fetching using `labelIds` to prevent list-jumbling issues and has been restyled to ensure all buttons and navigation elements are visually consistent with the application's overall design system.
    *   `Directory.tsx`: The component for the virtual file system.

---

## Getting Started

This guide will get a local copy of the project up and running on your machine for development and testing.

### Prerequisites

*   **Node.js**: Version 20.x or later.
*   **Docker**: For running the PostgreSQL database.
*   **Git**: For cloning the repository.
*   **A Code Editor**: We recommend VS Code.
*   **API Keys**: You must have all necessary API keys (Google Cloud, Stripe, etc.) before starting.

### 1. Start the Database

First, let's get the PostgreSQL database running using Docker.

1.  Open a terminal window.
2.  Run the following command to start a new PostgreSQL container. Replace `your_secure_password` with a password of your choice.
    ```bash
    docker run --name business-brain-db -e POSTGRES_PASSWORD=your_secure_password -p 5432:5432 -d postgres:latest
    ```
    This will start a database container named `business-brain-db` in the background.

### 2. Backend Setup

Now, let's get the secure backend server running.

1.  Open a **new, separate terminal window**.
2.  Navigate into the `backend` directory:
    ```bash
    cd backend
    ```
3.  Create your `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
4.  Open the new `.env` file and add your secret keys.
5.  Update the `DATABASE_URL` in your `.env` file. It should match the password you chose in the previous step. A default database name like `business_brain_db` is recommended.
    ```
    DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5432/business_brain_db?schema=public"
    ```
6.  Install all backend dependencies:
    ```bash
    npm install
    ```
7.  Apply the database schema:
    ```bash
    npx prisma db push
    ```
8.  Start the backend development server:
    ```bash
    npm run dev
    ```

Your backend is now running on `http://localhost:8000`. Leave this terminal running.

### 3. Frontend Setup

Now, let's get the React user interface running.

1.  Open a **third, separate terminal window**.
2.  Navigate into the `frontend` directory:
    ```bash
    cd frontend
    ```
3.  Install all frontend dependencies:
    ```bash
    npm install
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```

Your frontend is now running on `http://localhost:5173`.

### 4. Running the Application

1.  Open your web browser and navigate to the frontend URL: `http://localhost:5173`.
2.  You should see the application's home page.
3.  Click the "Login with Google" button to test the full authentication flow and access the workspace.
