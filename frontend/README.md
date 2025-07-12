
# Business Brain AI Assistant (Production Setup)

This document provides the complete technical documentation and setup guide for the Business Brain AI Assistant application, configured for a professional production environment with a separate frontend and backend.

---

## Quickstart Guide

This guide will get you a local copy of the project up and running on your machine for development.

### Prerequisites

*   **Node.js**: Version 20.x or later.
*   **Git**: For cloning the repository.
*   **A Code Editor**: Like VS Code.
*   **All API Keys**: You must have completed the API key acquisition steps from the previous guide.

### 1. Backend Setup

First, let's get the secure backend server running.

1.  Open a new terminal window.
2.  Navigate into the `backend` directory:
    ```bash
    cd backend
    ```
3.  Create your `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
4.  Open the new `.env` file and paste in the secret keys you have acquired.
5.  Install all backend dependencies:
    ```bash
    npm install
    ```
6.  Start the backend development server:
    ```bash
    npm run dev
    ```

Your backend is now running, likely on `http://localhost:8000`. Leave this terminal window open.

### 2. Frontend Setup

Now, let's get the React user interface running.

1.  Open a **second, separate terminal window**.
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

Your frontend is now running, likely on `http://localhost:5173`.

### 3. Running the Application

1.  Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  You should see the "Business Brain" home page.
3.  Click the "Login with Google" button to test the full authentication flow.

---

## Architectural Overview

*   **Frontend**: A **React** application built with **Vite**. It is responsible for the user interface and makes API calls to our backend.
*   **Backend**: A **Node.js/Express** server that acts as a secure API gateway. It handles all secret keys, communicates with Google APIs (OAuth & Gemini), and manages user sessions.
*   **Authentication**: Secure **JWT** (JSON Web Tokens) are issued by the backend after a successful Google OAuth 2.0 login. The frontend stores this token to make authenticated requests.

---

## Project Structure

```
business-brain-prod/
├── backend/
│   ├── src/
│   │   └── index.ts      # The main backend server file
│   ├── .env              # Your secret keys (you create this)
│   ├── .env.example      # Template for environment variables
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.tsx
    │   ├── index.css
    │   ├── index.tsx
    │   └── types.ts
    ├── index.html        # Entry point for Vite
    ├── package.json
    ├── vite.config.ts
    └── ...
```