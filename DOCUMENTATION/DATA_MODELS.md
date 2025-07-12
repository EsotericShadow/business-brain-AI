# Data Model & State Guide

This document explains the core data structures used throughout the application, from the database schema to the shared types and frontend state.

---

## 1. Database Schema (`backend/prisma/schema.prisma`)

The database schema is managed by Prisma and is the single source of truth for persisted data.

### `User` Model

This model represents a single user of the application. Its `id` is a standard CUID, making it provider-agnostic.

| Field                 | Type                | Description                                                              |
| --------------------- | ------------------- | ------------------------------------------------------------------------ |
| `id`                  | `String`            | **Primary Key.** A unique CUID.                                          |
| `email`               | `String`            | The user's email address. Must be unique.                                |
| `name`                | `String?`           | The user's full name.                                                    |
| `avatarUrl`           | `String?`           | A URL to the user's profile picture.                                     |
| `stripeCustomerId`    | `String?`           | The user's unique ID in Stripe for managing subscriptions.               |
| `planId`              | `String`            | The ID of the user's current plan (e.g., "free", "pro").                 |
| `tokenBalance`        | `Int`               | The number of AI tokens the user has remaining.                          |
| `onboardingCompleted` | `Boolean`           | A flag to track if the user has completed the initial setup wizard.      |
| `forwardingAddresses` | `ForwardingAddress[]` | A list of the user's private forwarding addresses.                       |
| `emails`              | `Email[]`           | A list of all emails ingested by the user.                               |
| `loginTokens`         | `LoginToken[]`      | A list of active single-use login tokens for passwordless auth.          |

### `ForwardingAddress` Model

This model stores the unique email addresses that users can forward emails to.

| Field   | Type     | Description                                      |
| ------- | -------- | ------------------------------------------------ |
| `id`    | `String` | **Primary Key.** A unique CUID.                  |
| `email` | `String` | The unique forwarding email address (e.g., `user@mail.your-app.com`). |
| `userId`| `String` | A foreign key linking to the `User`.             |

### `Email` Model

This model stores the content of emails ingested by the system.

| Field       | Type    | Description                                      |
| ----------- | ------- | ------------------------------------------------ |
| `id`        | `String`| **Primary Key.** A unique CUID.                  |
| `from`      | `String`| The sender's email address.                      |
| `to`        | `String`| The recipient's email address (the forwarding address). |
| `subject`   | `String`| The subject line of the email.                   |
| `body`      | `String`| The plain text body of the email.                |
| `html`      | `String?`| The HTML body of the email.                      |
| `userId`    | `String`| A foreign key linking to the `User`.             |

### `LoginToken` Model

This model stores the single-use tokens for the passwordless magic link authentication.

| Field     | Type     | Description                                      |
| --------- | -------- | ------------------------------------------------ |
| `id`      | `String` | **Primary Key.** The secure, random token string. |
| `userId`  | `String` | A foreign key linking to the `User`.             |
| `expiresAt`| `DateTime`| The timestamp for when the token expires.        |

---

## 2. Shared Types (`shared/types/index.ts`)

The key shared types (`User`, `Email`, etc.) are updated to mirror the new database schema, ensuring type safety between the frontend and backend.