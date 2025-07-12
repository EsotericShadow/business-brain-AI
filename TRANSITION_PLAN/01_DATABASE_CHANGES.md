# Transition Plan: 01 - Database Changes

This document outlines the required changes to the database schema to support the "Digital Mailroom" feature. The changes will be made in the `backend/prisma/schema.prisma` file.

## 1. Modifications to the `User` Model

A new field, `forwardingAddress`, will be added to the `User` model. This field will store the unique, user-specific email address for forwarding.

-   **Field:** `forwardingAddress`
-   **Type:** `String`
-   **Attributes:** `@unique`, `@map("forwarding_address")`

## 2. New `Email` Model

A new model, `Email`, will be created to store the content of the emails ingested into the system. This model will have a relationship with the `User` model to associate each email with its owner.

### `Email` Model Schema:

| Field         | Type     | Description                                                                |
|---------------|----------|----------------------------------------------------------------------------|
| `id`          | `String` | **Primary Key.** A unique identifier for the email (e.g., CUID).           |
| `from`        | `String` | The sender's email address.                                                |
| `to`          | `String` | The recipient's email address (the unique forwarding address).             |
| `subject`     | `String` | The subject line of the email.                                             |
| `body`        | `String` | The plain text body of the email.                                          |
| `html`        | `String?`| The HTML body of the email (optional).                                     |
| `attachments` | `Json?`  | A JSON object to store information about any attachments (optional).       |
| `userId`      | `String` | A foreign key to link the email to a `User`.                               |
| `user`        | `User`   | A relation to the `User` model.                                            |
| `createdAt`   | `DateTime`| Timestamp of when the email was ingested.                                  |
| `updatedAt`   | `DateTime`| Timestamp of the last update to the email record.                          |

## 3. Proposed `schema.prisma`

Here is the proposed state of the `backend/prisma/schema.prisma` file after applying the changes:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                 String    @id // Google 'sub'
  email              String    @unique
  name               String?
  avatarUrl          String?   @map("avatar_url")
  
  gmailAccessToken   String?   @map("gmail_access_token")
  gmailRefreshToken  String?   @map("gmail_refresh_token")

  forwardingAddress  String?   @unique @map("forwarding_address")

  stripeCustomerId   String?   @unique @map("stripe_customer_id")
  planId             String    @default("free") @map("plan_id")
  tokenBalance       Int       @default(500) @map("token_balance")
  trialEndsAt        DateTime? @map("trial_ends_at")
  
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  emails Email[]
}

model Email {
  id          String   @id @default(cuid())
  from        String
  to          String
  subject     String
  body        String
  html        String?
  attachments Json?
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
