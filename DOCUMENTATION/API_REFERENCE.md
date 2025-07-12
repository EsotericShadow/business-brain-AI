# API Reference

This document provides a detailed reference for all the API endpoints available in the `backend` server.

---

## Authentication API

These endpoints manage the user authentication flow using a provider-agnostic, passwordless "magic link" system.

### `POST /api/auth/login`

*   **Description:** Initiates the login or signup process. If the user's email does not exist, a new user is created. It then generates a single-use login token and sends a "magic link" to the user's email.
*   **Request Body:**
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **Response:**
    ```json
    {
      "message": "Check your email for a login link."
    }
    ```

### `GET /api/auth/verify`

*   **Description:** This endpoint is not called directly by the frontend. The user clicks the magic link which points here. The backend verifies the token, creates a session, and redirects the user to the frontend's callback URL.
*   **Request Query Parameters:**
    *   `token`: The single-use login token.
*   **Response:** A 302 redirect to `/auth/callback?token=<session_jwt>`.

### `GET /api/me`

*   **Description:** Retrieves the profile of the currently authenticated user. Requires a valid session JWT.
*   **Request:** None.
*   **Response:** A JSON object representing the `User` model.

---

## Digital Mailroom API

These endpoints manage the ingestion and retrieval of emails forwarded to the user's private addresses.

### `POST /api/ingest/email`

*   **Description:** A webhook endpoint designed to receive parsed email data from a third-party transactional email service (e.g., Mailgun, SendGrid). It finds the user associated with the recipient address and saves the email to the database.
*   **Authentication:** Requires webhook signature verification (provider-specific).
*   **Request Body:** A JSON payload from the email provider containing the parsed email (sender, recipient, subject, body, etc.).
*   **Response:** `200 OK` on success.

### `GET /api/emails`

*   **Description:** Retrieves all ingested emails for the authenticated user.
*   **Request:** None.
*   **Response:**
    ```json
    {
      "success": true,
      "emails": [ ... ] // Array of Email objects
    }
    ```

### `GET /api/forwarding-addresses`

*   **Description:** Retrieves all forwarding addresses for the authenticated user.
*   **Request:** None.
*   **Response:**
    ```json
    {
      "success": true,
      "addresses": [ ... ] // Array of ForwardingAddress objects
    }
    ```

### `POST /api/forwarding-addresses`

*   **Description:** Creates a new, unique forwarding address for the user.
*   **Request Body:**
    ```json
    {
      "email": "new-alias@mail.your-app.com"
    }
    ```
*   **Response:** The newly created `ForwardingAddress` object.

### `DELETE /api/forwarding-addresses/:id`

*   **Description:** Deletes a forwarding address for the user.
*   **Request:** None.
*   **Response:** `200 OK` on success.

---

## General AI API

### `POST /api/gemini/chat`

*   **Description:** A general-purpose endpoint for interacting with the configured AI model.
*   **Request Body:**
    ```json
    {
      "prompt": "What is the capital of France?"
    }
    ```
*   **Response:**
    ```json
    {
      "data": {
        "type": "text",
        "content": "Paris"
      }
    }
    ```