# Bug Report Summary

This document provides a summary of the key bugs encountered during the development and debugging of the Gmail integration feature.

---

### Bug 1: Misconfigured Vite Proxy

-   **Symptom:** The frontend would fail to fetch data (e.g., emails), and the browser console showed a `SyntaxError` because it received an HTML page instead of the expected JSON response.
-   **Root Cause:** The Vite development server was not correctly proxying API requests from the frontend (running on `localhost:5173`) to the backend (running on `localhost:8000`). This was due to running `npm run dev` from the root directory, which used a `vite.config.ts` that was not configured for a React application.
-   **Initial Incorrect Fix:** The proxy configuration was added to the root `vite.config.ts`, but this was the wrong approach as the frontend has its own configuration.
-   **Resolution:** The investigation clarified that the correct workflow is to run the frontend dev server from the `frontend/` directory and the backend server from the `backend/` directory. The `frontend/vite.config.ts` already contained the correct proxy setup. The root `vite.config.ts` was reverted to its original state to avoid confusion.

---

### Bug 2: Invalid Gemini API Key

-   **Symptom:** The backend returned a `500 Internal Server Error` when making a request to the `/api/gmail/ai` endpoint. The backend logs showed a `400 Bad Request` from the Google Generative AI API with the error message: `API key not valid`.
-   **Root Cause:** There was a combination of issues related to environment variables:
    1.  **Loading Order:** The `dotenv.config()` call in `backend/src/index.ts` was happening *after* the Gemini AI client was initialized, so `process.env.API_KEY` was `undefined`.
    2.  **Inconsistent Naming:** The backend code was inconsistent. `backend/src/index.ts` was looking for `API_KEY`, while `backend/src/routes/gmail.ts` was looking for `GEMINI_API_KEY`. The user's `.env` file also contained both variables, leading to confusion.
-   **Resolution:**
    1.  The `dotenv.config()` call was moved to the very top of `backend/src/index.ts` to ensure variables are loaded first.
    2.  The code was standardized to *only* use `GEMINI_API_KEY` for the Google AI client.
    3.  The user was instructed to clean up their `.env` file to use a single, valid `GEMINI_API_KEY`.

---

### Bug 3: Persistent Caching Issue

-   **Symptom:** Even after correcting the environment variables and restarting the server, the `API key not valid` error persisted.
-   **Root Cause:** This was likely due to a caching issue within Node's module system or `npm`'s dependency management.
-   **Resolution:** A clean reinstallation of the backend dependencies was performed by:
    1.  Deleting the `backend/node_modules` directory.
    2.  Deleting the `backend/package-lock.json` file.
    3.  Running `npm install --prefix backend` to reinstall all packages from scratch.
