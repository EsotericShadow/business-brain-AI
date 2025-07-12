# Issue: Layout Instability and Content Overflow

## 1. Summary

The main workspace view, which is split between the Chat interface and the Workspace tabs (Directory, Emails, etc.), suffers from significant layout instability. When content in the workspace panel (e.g., a wide email) is loaded, it forces the panel to expand, which in turn shrinks the chat panel. This creates a "jumping" or "shifting" effect that is disruptive to the user experience.

## 2. Root Cause

The core of the problem lies in the implementation of the `react-resizable-panels` library in `frontend/src/Workspace.tsx`. The `Panel` components are not being constrained correctly, and their width is being influenced by the size of their children content.

- **Resizable Panels:** The `PanelGroup` is set up to allow users to resize the chat and workspace panels. However, when new content is loaded, the panels are automatically resizing to fit that content, which is not the desired behavior.
- **Content Overflow:** The content inside the panels, particularly the `EmailView` component, is not being properly contained. This causes the content to overflow its container, which then triggers the panel to resize.

## 3. Key Files

- **`frontend/src/Workspace.tsx`**: This file contains the main layout structure, including the `PanelGroup` and `Panel` components that define the chat and workspace areas.
- **`frontend/src/components/EmailView.tsx`**: This component is a primary source of the issue, as emails with wide content (images, tables, etc.) are causing the overflow.
- **`frontend/src/components/EmailView.css`**: This file contains the styling for the `EmailView` component and is where the overflow issues need to be addressed.

## 4. Desired Behavior

The panels should have a stable, predictable width. When content inside a panel is too wide to fit, the panel itself should not resize. Instead, the content should be contained within the panel, with a horizontal scrollbar appearing if necessary. The user should always be in control of the panel widths via the `PanelResizeHandle`.

## 5. Proposed Solution

A combination of changes is needed to fix this:

1.  **Stabilize Panel Widths:** In `Workspace.tsx`, ensure the `main` and `aside` elements within the `Panel` components have a `min-w-0` class. This will prevent their content from expanding the panel's width.
2.  **Contain Content:** In `EmailView.css`, the `.email-body-content` class needs to be styled to handle overflow correctly. This includes:
    - Setting `overflow-x: auto` to enable horizontal scrolling when needed.
    - Applying `max-width: 100%` to images and other elements to ensure they don't break the layout.
    - Using `word-break: break-word` to wrap long text.
    - Special handling for tables to make them scrollable.
