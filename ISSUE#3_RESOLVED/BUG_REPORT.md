# Bug Report: Gmail API returns HTML page instead of JSON

**ID:** ISSUE#3
**Date:** 2025-07-09
**Status:** Open
**Reporter:** Gemini

---

### 1. Description

When the user navigates to the "Email" tab in the application, the frontend makes an API call to `/api/gmail/emails` to fetch the user's emails. The expected result is a JSON array of email objects.

Instead, the API returns a 200 OK status with the full HTML content of the main `index.html` page. This causes a JSON parsing error in the frontend's API client, preventing the email feature from working.

### 2. Steps to Reproduce

1.  In one terminal, navigate to the `backend` directory and start the server: `npm run dev`.
2.  In a second terminal, navigate to the `frontend` directory and start the server: `npm run dev`.
3.  Open the application in a browser (e.g., http://localhost:5173/).
4.  Complete the Google OAuth login flow.
5.  After being redirected to the main application, click on the "Email" tab.
6.  Open the browser's developer console.

### 3. Observed Behavior

-   The frontend displays an error message: "Failed to fetch emails: Error: Expected JSON but received a different format. Status: 200."
-   The developer console shows that the response to the `GET /api/gmail/emails` request is an HTML document, not JSON.
-   The backend terminal shows no errors and indicates a successful user creation.

### 4. Expected Behavior

-   The `GET /api/gmail/emails` request should return a JSON array of the user's emails.
-   The "Email" tab should display the list of emails fetched from the Gmail API.

### 5. Analysis & Hypothesis

The core issue appears to be a misconfiguration in the Vite development server's proxy. The frontend application is running from the `/frontend` directory, which has its own `vite.config.ts`. This configuration is missing the `server.proxy` setup required to forward API requests from the frontend to the backend.

Because the proxy is missing, when the frontend calls `/api/gmail/emails`, the Vite server doesn't recognize it as an API call to be forwarded. Instead, it treats it as a client-side route and serves the default `index.html` file as a fallback, which is the standard behavior for Single Page Applications (SPAs).

The fix implemented in the root `vite.config.ts` was correct, but it was applied to the wrong file. The developer is running the dev server from the `frontend` directory, which uses `frontend/vite.config.ts`.

### 6. Suggested Fix

1.  Open the Vite configuration file located at `frontend/vite.config.ts`.
2.  Add the `server.proxy` configuration to the `defineConfig` call, pointing all requests to `/api/*` to the backend server running on `http://localhost:8000`.

**Example:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { // Add this server block
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```
3.  Restart the frontend development server after applying the changes.

---
### 7. Supporting Files

The following files have been added to the `ISSUE#3` directory for full context:
- `frontend/vite.config.ts` (The misconfigured file)
- `vite.config.ts` (The root config, for reference)
- `components/EmailView.tsx` (The component making the call)
- `services/api.ts` (The API client)
- `backend/src/routes/gmail.ts` (The backend route)
- `backend/src/index.ts` (The main backend server file)
- `frontend/package.json`
- `backend/package.json`
- `logs/frontend_console.txt`
- `logs/backend_terminal.txt`
