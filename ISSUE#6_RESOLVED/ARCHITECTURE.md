# Architecture Overview

This document outlines the technical architecture of the Business Brain AI Assistant, which is divided into a frontend application and a backend server.

---

### 1. Frontend Architecture

The frontend is a Single Page Application (SPA) built with modern web technologies to provide a responsive and interactive user experience.

-   **Framework:** **React** with **Vite** for a fast development environment.
-   **Language:** **TypeScript** for type safety and improved code quality.
-   **UI Components:** A mix of custom components and potentially a UI library like Tailwind CSS for styling.
-   **Routing:** `react-router-dom` for handling client-side navigation.
-   **State Management:** React hooks (`useState`, `useContext`) for managing local and global application state.
-   **API Communication:** A dedicated `api.ts` service module that uses `fetch` to make requests to the backend. It's responsible for handling responses, errors, and authentication tokens.

**Key Directories (`frontend/src`):**
-   `components/`: Reusable UI components (e.g., `ChatWindow`, `Sidebar`, `EmailView`).
-   `pages/`: Top-level page components that correspond to different application routes.
-   `services/`: Modules for interacting with external APIs (e.g., `api.ts`, `geminiService.ts`).

### 2. Backend Architecture

The backend is a Node.js server responsible for handling business logic, security, and integration with third-party services.

-   **Framework:** **Express.js** as the web server framework.
-   **Language:** **TypeScript** with `ts-node` for development.
-   **Authentication:**
    -   **User Login:** JWT (JSON Web Tokens) are issued to users after they authenticate with Google.
    -   **Google API:** OAuth 2.0 tokens (access and refresh) are securely stored to make API calls on behalf of the user.
-   **Database:** An in-memory object (`usersDB`) acts as a simple database for this prototype, storing user profiles and tokens.
-   **API Routes:** The API is structured under the `/api` prefix, with dedicated route files for different resources (e.g., `gmail.ts`, `gemini.ts`).
-   **Security:**
    -   `helmet` to set secure HTTP headers.
    -   `cors` to restrict requests to the frontend URL.
    -   `cookie-parser` to handle JWTs stored in cookies.
    -   Input validation using `zod`.

### 3. Communication Flow

1.  **User Interaction:** The user interacts with the React frontend in their browser.
2.  **API Request:** The frontend makes an API call to a backend endpoint (e.g., `POST /api/gmail/ai`). The JWT is sent in an `Authorization` header or cookie.
3.  **Backend Processing:**
    -   The backend's `verifyJwt` middleware validates the token.
    -   The corresponding route handler processes the request.
    -   If needed, the backend uses stored OAuth 2.0 tokens to call the Google API (e.g., Gmail).
    -   If AI processing is needed, the backend calls the Google Gemini API.
4.  **API Response:** The backend sends a JSON response back to the frontend.
5.  **UI Update:** The frontend updates the UI based on the response.
