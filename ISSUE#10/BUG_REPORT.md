# Bug Report: ISSUE #10

**Date:** 2025-07-11

**Status:** Critical - Blocker

---

## 1. Summary

The application crashes on startup with a white screen due to a JavaScript module loading error. The browser's console shows a persistent `Uncaught SyntaxError: The requested module '/@fs/.../shared/utils/directoryUtils.js' does not provide an export named 'toggleVisibility'`.

This error occurs when `frontend/src/Workspace.tsx` attempts to import the `toggleVisibility` function from `shared/utils/directoryUtils.ts`. The error persists even though the function is correctly defined and exported in the source TypeScript file. This indicates a build-time or dev-server configuration issue, not a simple code error.

The application was previously working, but this regression was introduced during attempts to add new features to the `EmailView` and `Workspace` components.

## 2. Environment

*   **Project Structure:** Monorepo-like, with `frontend`, `backend`, and `shared` directories.
*   **Frontend Build Tool:** Vite
*   **Path Aliases:** The project uses TypeScript path aliases (`@/*` and `@shared/*`) to simplify imports between directories. These are configured in both `tsconfig.json` and `vite.config.ts`.

## 3. Analysis of Failed Fixes

Multiple attempts were made to resolve this issue, all of which failed and led to a frustrating loop. Documenting these failures is critical for understanding the problem's nature.

1.  **Incorrect Path Alias:** Initially, the import path in `Workspace.tsx` was wrong. Attempts were made using `@/shared/...` and other incorrect variations. This was corrected to `@shared/utils/directoryUtils`, which is the proper alias according to `frontend/tsconfig.json`. **This did not solve the issue.**

2.  **Vite Cache:** It was hypothesized that Vite's cache was serving a stale, incorrect version of the `directoryUtils.js` module. The `dev` script in `frontend/package.json` was modified to run `vite --force` to clear the cache. **This did not solve the issue.**

3.  **Vite `resolve.alias`:** An attempt was made to explicitly define the `@shared` alias in the root `vite.config.ts`. While well-intentioned, this was redundant with the `tsconfig-paths` plugin that Vite uses and did not address the core transpilation problem.

4.  **Vite `optimizeDeps.include`:** A more advanced attempt involved adding `@shared/utils/directoryUtils.ts` to `optimizeDeps.include` in `vite.config.ts`. This was a step in the right direction, as it forces Vite to pre-bundle the linked dependency. However, it was insufficient on its own, suggesting a deeper configuration conflict.

## 4. Root Cause Analysis

The persistent failure, despite correct path aliases and cache clearing, points to a fundamental misconfiguration in how Vite's development server handles files outside of the frontend's project root (`frontend/`).

The `shared` directory is a sibling to `frontend`, not a child. By default, Vite's dev server restricts file system access for security and performance. While path aliases tell Vite *where* to find the file, additional configuration is required to ensure Vite has permission to *access and process* it correctly.

The file is being served, but likely as a raw, untranspiled TypeScript file, which the browser cannot interpret. The browser's module loader (`import`) therefore cannot find the `export` statement, leading to the error.

## 5. Recommended Solution

To resolve this, the Vite configuration must be updated to explicitly allow access to the parent directory and ensure the shared files are transformed.

1.  **Update `vite.config.ts`:**
    *   Add `server.fs.allow` to grant the dev server permission to access the project's root directory, which contains the `shared` folder.
    *   Keep the `resolve.alias` configuration to ensure module resolution works correctly.

2.  **Provide Corrected Code:**

    **File:** `vite.config.ts`
    ```javascript
    import path from 'path';
    import { defineConfig, loadEnv } from 'vite';

    export default defineConfig(({ mode }) => {
        const env = loadEnv(mode, '.', '');
        return {
          server: {
            proxy: {
              '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
              },
            },
            // Grant access to the parent directory.
            fs: {
              allow: ['..'],
            },
          },
          define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
          },
          resolve: {
            alias: {
              // This alias is for the frontend src directory
              '@': path.resolve(__dirname, './frontend/src'),
              // This alias is for the shared directory
              '@shared': path.resolve(__dirname, './shared'),
            }
          }
        };
    });
    ```

3.  **Verify Import Statement:**
    Ensure the import statement in `frontend/src/Workspace.tsx` uses the correct alias.

    **File:** `frontend/src/Workspace.tsx`
    ```typescript
    import { findItem, findPath, downloadItems, createItem, deleteItems, pasteItems, toggleVisibility } from '@shared/utils/directoryUtils';
    ```

This configuration directly addresses the file system access and module resolution issues, which are the true root cause of this persistent bug.
