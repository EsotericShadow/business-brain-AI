# Transition Plan: 02 - Backend API

This document describes the new API endpoint required to handle incoming emails from a third-party transactional email service (e.g., Mailgun, SendGrid).

## 1. Endpoint Definition

-   **Route:** `POST /api/ingest/email`
-   **Method:** `POST`
-   **Description:** This endpoint will serve as a webhook to receive parsed email data. It will be responsible for authenticating the request, identifying the user, and triggering the email ingestion service.

## 2. Authentication

This endpoint will **not** be protected by the standard user session JWT authentication, as it is called by an automated service, not a logged-in user.

Authentication will be handled by verifying a signature provided by the email service. For example, Mailgun sends the following in its webhook POST request:

-   `timestamp`: The timestamp of the event.
-   `token`: A random token.
-   `signature`: An HMAC signature of the `timestamp` and `token`, signed with your Mailgun API key.

The backend will use the stored Mailgun API key to generate its own signature from the `timestamp` and `token` and compare it to the `signature` in the request. This ensures that the request is legitimate and originated from Mailgun.

## 3. Request Payload

The endpoint will expect a `JSON` payload representing the parsed email. The exact structure will depend on the provider, but it will generally conform to the following structure (example from Mailgun):

```json
{
  "sender": "user@example.com",
  "recipient": "dave@project-alpha.your-app-domain.com",
  "subject": "Fwd: Project Update",
  "body-plain": "This is the text body of the email...",
  "body-html": "<html>...</html>",
  "attachments": [
    {
      "url": "https://api.mailgun.net/v3/domains/mg.example.com/messages/...",
      "content-type": "application/pdf",
      "name": "report.pdf",
      "size": 123456
    }
  ],
  // Mailgun-specific signature fields
  "signature": {
    "timestamp": "1529006854",
    "token": "a8ce073a8b2c44c58741f8b8647541106e1f48a3b160c35439",
    "signature": "3b751a32b3c06df5a2b2e794a1a4e0e018b3a3388e35399fff35e3cd23d9e9b5"
  }
}
```

## 4. Response

-   **On Success:** The endpoint will respond with a `200 OK` status code and a simple JSON body like `{ "status": "success" }`. This acknowledges receipt of the email.
-   **On Failure:**
    -   If authentication fails, it will respond with a `401 Unauthorized`.
    -   If the user cannot be found, it will respond with a `404 Not Found`.
    -   For any other processing errors, it will respond with a `500 Internal Server Error`.
