# Transition Plan: 03 - Email Ingestion Service

This document details the logic for the new backend service responsible for processing the JSON payload from the webhook and saving the email data to the database.

## 1. Service Location

A new file will be created at `backend/src/services/email-ingestion.service.ts`.

## 2. Core Logic

The service will expose a primary function, e.g., `processInboundEmail(payload)`. This function will execute the following steps:

1.  **Extract Key Data:** The function will receive the full JSON payload from the `/api/ingest/email` endpoint. It will first extract the essential fields:
    -   `from` (from `sender`)
    -   `to` (from `recipient`)
    -   `subject`
    -   `body` (from `body-plain`)
    -   `html` (from `body-html`)
    -   `attachments`

2.  **Identify the User:** The service will use the `recipient` email address (e.g., `dave@project-alpha.your-app-domain.com`) to find the corresponding user in the database.
    -   It will perform a database query on the `User` table:
        ```typescript
        const user = await prisma.user.findUnique({
          where: {
            forwardingAddress: recipientAddress,
          },
        });
        ```

3.  **Handle User Not Found:** If no user is found with that `forwardingAddress`, the service will throw an error. This error will be caught by the API route, which will then return a `404 Not Found` response. This is important to prevent the email service from endlessly retrying a delivery to a non-existent address.

4.  **Create the Email Record:** If a user is found, the service will create a new record in the `Email` table.
    -   It will call `prisma.email.create()` with the extracted data, associating it with the found user's ID:
        ```typescript
        await prisma.email.create({
          data: {
            from: extractedFrom,
            to: extractedTo,
            subject: extractedSubject,
            body: extractedBody,
            html: extractedHtml,
            attachments: extractedAttachments,
            userId: user.id,
          },
        });
        ```

## 3. Attachment Handling Strategy

For the initial implementation, the `attachments` field will store the metadata provided by the email service (e.g., file name, size, content type, and a temporary download URL).

-   **Future Enhancement:** A more robust solution would involve a background job that downloads the attachment from the temporary URL, scans it for viruses, and then stores it in a dedicated cloud storage bucket (like Amazon S3 or Google Cloud Storage). The `attachments` JSON would then be updated with a permanent link to this stored file. This is out of scope for the initial implementation but should be considered for future development.

## 4. Generating the Forwarding Address

A separate function will be created, likely in `gmail-auth.service.ts` or a new `user.service.ts`, to generate the unique `forwardingAddress` for a user upon signup.

-   **Format:** `[username]@[projectname].your-app-domain.com`
-   **Customization:** The user will be able to customize the `[username]` prefix.
-   **Uniqueness:** The system must ensure that the generated address is unique across all users.
