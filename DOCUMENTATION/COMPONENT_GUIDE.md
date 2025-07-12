# Frontend Component Guide

This document provides an overview of the key React components in the `frontend/src/components/` directory, explaining their purpose and props.

---

## Core UI Components

### `Sidebar.tsx`

*   **Purpose:** Renders the main collapsible navigation sidebar.
*   **Key Props:** `isSidebarOpen`, `user`, `chats`, `onNewChat`, `onLogout`.

### `ChatWindow.tsx`

*   **Purpose:** The main interface for displaying the conversation between the user and the AI.
*   **Key Props:** `messages`, `isLoading`.

### `InputField.tsx`

*   **Purpose:** The text input field where the user types their prompts.
*   **Key Props:** `onSendMessage`, `isLoading`.

## Workspace Tab Components

### `MailroomView.tsx`

*   **Purpose:** The primary interface for the "Digital Mailroom." It displays a two-panel view with a list of ingested emails on the left and the content of the selected email on the right.
*   **Key Features:**
    *   Fetches data from the new `/api/emails` endpoint.
    *   Uses `DOMPurify` to safely render email HTML.
    *   Contains the "Draft Reply with AI" button, which initiates the AI-powered reply flow.
    *   Handles the "mailto:" link generation for sending replies through the user's default email client.

### `Directory.tsx`

*   **Purpose:** Renders the virtual file system for document management.
*   **Key Props:** `items`, `breadcrumbs`, and a comprehensive set of callbacks for file operations.

### `FileViewer.tsx`

*   **Purpose:** Displays the content of a selected file from the `Directory`.
*   **Key Props:** `file`, `onClose`, `onUpdateContent`.

## Onboarding & Settings Components

### `MailroomWizard.tsx`

*   **Purpose:** A user-initiated wizard to guide the user through creating their first private forwarding address.
*   **Key Features:**
    *   Provides a clear UI for choosing a unique email alias.
    *   Calls the `/api/forwarding-addresses` endpoint to create the new address.
    *   Gives the user instructions on how to set up auto-forwarding in their own email client.

### `ForwardingAddressSettings.tsx`

*   **Purpose:** A component (usually shown in a modal) that allows users to view, add, and delete their forwarding addresses.
*   **Key Features:**
    *   Lists all current addresses for the user.
    *   Provides a form to create new addresses.
    *   Allows for the deletion of existing addresses.

## Authentication & Pages

### `HomePage.tsx` (`frontend/src/pages/`)

*   **Purpose:** The main public-facing landing page for unauthenticated users.
*   **Functionality:** Contains the email input form to initiate the passwordless "magic link" login flow by calling `/api/auth/login`.

### `VerifyPage.tsx` (`frontend/src/pages/`)

*   **Purpose:** A transient page that the user is sent to when they click the magic link in their email.
*   **Functionality:** Its sole purpose is to trigger a request to the backend's `/api/auth/verify` endpoint. The backend then handles the token verification and redirects to the `AuthCallbackPage`.

### `AuthCallbackPage.tsx` (`frontend/src/pages/`)

*   **Purpose:** The final step in the authentication flow.
*   **Functionality:**
    1.  Receives the `session_jwt` as a URL parameter from the backend.
    2.  Calls the `onAuthSuccess` prop (from `App.tsx`) to store the token.
    3.  Redirects the user to the main workspace.