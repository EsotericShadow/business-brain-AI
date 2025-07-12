# Database Schema for Scheduled Emails

To support scheduled emails, we need a new table in our database to store the scheduling information. This table will contain the necessary details to send the email at the specified time.

## `scheduled_emails` Table

| Column          | Data Type     | Description                                                              |
| --------------- | ------------- | ------------------------------------------------------------------------ |
| `id`            | `SERIAL`      | Primary key for the scheduled email.                                     |
| `user_id`       | `VARCHAR(255)`| Foreign key referencing the `users` table to associate the email with a user. |
| `to`            | `VARCHAR(255)`| The recipient's email address.                                           |
| `subject`       | `VARCHAR(255)`| The subject of the email.                                                |
| `body`          | `TEXT`        | The HTML body of the email.                                              |
| `scheduled_at`  | `TIMESTAMPTZ` | The date and time when the email is scheduled to be sent.                |
| `status`        | `VARCHAR(20)` | The status of the scheduled email. Can be `pending`, `sent`, or `failed`. |
| `created_at`    | `TIMESTAMPTZ` | The date and time when the scheduled email was created.                  |
| `updated_at`    | `TIMESTAMPTZ` | The date and time when the scheduled email was last updated.             |

## Example

Here's an example of how a scheduled email would be stored in the `scheduled_emails` table:

| id  | user_id | to                     | subject              | body                  | scheduled_at        | status  | created_at          | updated_at          |
| --- | ------- | ---------------------- | -------------------- | --------------------- | ------------------- | ------- | ------------------- | ------------------- |
| 1   | `user123` | `john.doe@example.com` | `Meeting Tomorrow`   | `<p>Hi John,...</p>` | `2025-07-11 10:00:00` | `pending` | `2025-07-10 15:30:00` | `2025-07-10 15:30:00` |
