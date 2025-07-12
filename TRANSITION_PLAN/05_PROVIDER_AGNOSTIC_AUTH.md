# Transition Plan: 05 - Provider-Agnostic Authentication

This document outlines the architecture for replacing the current Google OAuth2 implementation with a provider-agnostic, passwordless "magic link" authentication system.

## 1. Rationale

Decoupling from Google OAuth is a critical step towards making the application provider-agnostic. A magic link system offers several advantages:
-   **No Vendor Lock-in:** It is based on open standards (email, JWT) and does not rely on any single identity provider.
-   **Improved User Experience:** Users do not need to create or remember a password.
-   **Enhanced Security:** It reduces the risk associated with password breaches and can be more secure than passwords if implemented correctly.

## 2. Database Schema Changes

The `User` model's primary key must be decoupled from Google's `sub`. We will also need a new table to manage the single-use login tokens.

### 2.1. `User` Model Modifications

-   **Primary Key:** The `id` field will be changed from Google's `sub` to a standard, self-generated CUID (`@default(cuid())`).
-   **Google ID (Optional):** A new field, `googleId` (`String? @unique`), can be added to maintain a link to existing Google profiles for a smoother migration.
-   **Password:** A `password` field will be explicitly **omitted**.

### 2.2. New `LoginToken` Model

A new model is required to securely store the single-use tokens for the magic links.

| Field       | Type      | Description                                                              |
|-------------|-----------|--------------------------------------------------------------------------|
| `id`        | `String`  | **Primary Key.** A unique, cryptographically secure random string.       |
| `userId`    | `String`  | A foreign key linking the token to a `User`.                             |
| `user`      | `User`    | A relation to the `User` model.                                          |
| `expiresAt` | `DateTime`| The timestamp for when the token expires (e.g., 15 minutes from creation). |
| `createdAt` | `DateTime`| Timestamp of when the token was created.                                 |

## 3. Backend API Endpoints

Two new public endpoints will replace the existing `/api/auth/google/*` flow.

### 3.1. `POST /api/auth/login`

-   **Description:** Initiates the login or signup process.
-   **Request Body:** `{ "email": "user@example.com" }`
-   **Logic:**
    1.  Find or create a user with the provided email address.
    2.  Generate a secure, single-use `LoginToken`.
    3.  Store the hashed token in the `LoginToken` table.
    4.  Use a transactional email service (like Mailgun or SendGrid) to send an email to the user containing the magic link (e.g., `https://app.your-domain.com/auth/verify?token=THE_RAW_TOKEN`).
-   **Response:** `200 OK` with `{ "message": "Check your email for a login link." }`

### 3.2. `GET /api/auth/verify`

-   **Description:** Verifies the token from the magic link.
-   **Request Query Parameters:** `?token=<raw_login_token>`
-   **Logic:**
    1.  Hash the raw token from the query parameter.
    2.  Find the matching hashed token in the `LoginToken` table.
    3.  Verify that the token has not expired.
    4.  If valid, retrieve the associated `userId`.
    5.  Generate a standard session JWT for the user.
    6.  **Crucially, delete the `LoginToken` from the database** to ensure it cannot be used again.
    7.  Redirect the user to the main application workspace, passing the session JWT in the URL or a secure cookie.
-   **Response:** A 302 redirect to `/workspace?token=<session_jwt>`.

## 4. Frontend UI/UX Flow

The frontend login experience will be simplified.

1.  **Login Page:** The "Sign in with Google" button will be replaced with a single email input field and a "Continue with Email" button.
2.  **Requesting Link:** After the user enters their email and clicks the button, the UI will show a confirmation message: "Check your email for your magic link!"
3.  **Callback Handling:** The existing `AuthCallbackPage.tsx` can be repurposed to handle the redirect from the `/api/auth/verify` endpoint, extracting the session JWT from the URL and storing it, just as it does now.
