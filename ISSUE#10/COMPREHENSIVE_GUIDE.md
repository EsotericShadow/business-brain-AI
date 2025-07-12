# Comprehensive Guide: Getting Your App Back Up and Running

## Introduction

This guide addresses a critical issue preventing your application from starting, resulting in a white screen and a JavaScript module loading error in the browser console: `Uncaught SyntaxError: The requested module '/@fs/.../shared/utils/directoryUtils.js' does not provide an export named 'toggleVisibility'`. The application uses a monorepo-like structure with `frontend`, `backend`, and `shared` directories, built with Vite and TypeScript. The primary issues involve Vite’s development server configuration, syntax errors in utility files, and incorrect import statements. This guide provides step-by-step instructions to resolve these issues, along with troubleshooting tips, performance considerations, security implications, and prevention strategies.

## Prerequisites

Before proceeding, ensure you have:

*   Node.js and npm/yarn installed.
*   Basic knowledge of TypeScript, Vite, and monorepo setups.
*   Access to the project repository with `frontend`, `backend`, and `shared` directories.
*   A code editor (e.g., VS Code) and terminal access.

## Step-by-Step Fix Instructions

### Step 1: Update Vite Configuration

The primary issue is that Vite’s development server restricts access to files outside the `frontend` directory, such as the `shared` directory. To resolve this, update the `vite.config.ts` file to allow access to the parent directory and ensure correct path aliases.

**Corrected `vite.config.ts`:**
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
        // Grant access to the parent directory containing shared folder
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
          // Alias for the frontend src directory
          '@': path.resolve(__dirname, './frontend/src'),
          // Alias for the shared directory
          '@shared': path.resolve(__dirname, './shared'),
        }
      }
    };
});
```

**Explanation:**

*   `server.fs.allow: ['..']` permits the Vite development server to access the parent directory, enabling it to serve files from the `shared` directory.
*   The `resolve.alias` section defines `@` for the `frontend/src` directory and `@shared` for the `shared` directory, ensuring consistent module resolution.
*   The `proxy` configuration forwards `/api` requests to the backend server running on `http://localhost:8000`.

**Action:**

1.  Replace your existing `vite.config.ts` with the corrected version above.
2.  Ensure the file is located in the project root or adjust paths accordingly.

### Step 2: Verify TypeScript Configuration

Ensure that the TypeScript configuration aligns with the Vite aliases to prevent compilation issues. The `frontend/tsconfig.json` should include the following path aliases:

**Relevant `frontend/tsconfig.json` Section:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src/**/*", "vite.config.ts", "../shared/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Explanation:**

*   The `paths` configuration maps `@` to `frontend/src` and `@shared/*` to the `shared` directory, consistent with `vite.config.ts`.
*   The `include` array ensures TypeScript processes files in the `shared` directory.

**Action:**

1.  Verify or update `frontend/tsconfig.json` to include the above `paths`.
2.  Check the root `tsconfig.json` for any conflicting aliases. The root configuration may include:
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      }
    }
    ```
    Ensure no conflicts exist between root and frontend configurations.

### Step 3: Use Corrected Utility Files

The `shared/utils/directoryUtils.ts` file has been corrected to remove syntax errors, such as duplicate exports and incorrect import extensions. Below is a summary of the corrected file:

**Corrected `directoryUtils.ts` Overview:**

*   **Imports:** Correctly imports types from `../types/index` without `.js` extensions.
*   **Exports:** Includes functions like `findItem`, `findPath`, `createItem`, `deleteItems`, `pasteItems`, `downloadItems`, and `toggleVisibility` with single, proper export statements.
*   **Functionality:** Manages directory operations, such as creating, deleting, copying, and downloading items, and toggling file visibility.

**Example Snippet:**
```typescript
import type { ItemId, DirectoryItem, DirectoryNode, SpreadsheetFile, FileItem } from '../types/index';

export const toggleVisibility = (directory: { [id: string]: DirectoryItem }, fileId: ItemId): { [id: string]: DirectoryItem } => {
    const newDirectory = { ...directory };
    const file = newDirectory[fileId] as FileItem;
    if (file && file.type !== 'directory') {
        newDirectory[fileId] = { ...file, isVisible: !file.isVisible };
    }
    return newDirectory;
};
```

**Action:**

1.  Replace the existing `shared/utils/directoryUtils.ts` with the corrected version.
2.  Ensure all import statements in the file use TypeScript conventions (no `.js` extensions).

### Step 4: Verify Import Statements

Confirm that import statements in files like `frontend/src/Workspace.tsx` use the correct `@shared/*` alias.

**Correct Import in `Workspace.tsx`:**
```typescript
import { findItem, findPath, downloadItems, createItem, deleteItems, pasteItems, toggleVisibility } from '@shared/utils/directoryUtils';
```

**Action:**

1.  Open `frontend/src/Workspace.tsx` and verify the import statement matches the above.
2.  Check other files that import from `@shared/*` for consistency.

### Step 5: Set Up Environment Variables

The application uses environment variables, such as `GEMINI_API_KEY`, loaded via `loadEnv` in `vite.config.ts`.

**Action:**

1.  Create a `.env` file in the project root (or the directory where `vite.config.ts` resides).
2.  Add necessary environment variables, e.g.:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
    Ensure the `.env` file is not committed to version control if it contains sensitive information.

### Step 6: Install Dependencies

Ensure all dependencies are installed correctly for both `frontend` and `backend`.

**Action:**

1.  Navigate to the `frontend` directory and run:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
2.  If the `backend` has a separate `package.json`, navigate to the `backend` directory and repeat the installation.

### Step 7: Start the Backend Server

The application may require a backend server, as indicated by the `/api` proxy in `vite.config.ts`.

**Action:**

1.  Navigate to the `backend` directory and start the server, e.g.:
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
2.  Verify the backend is running on `http://localhost:8000`.

### Step 8: Start the Frontend Development Server

Start the Vite development server to serve the frontend.

**Action:**

1.  Navigate to the `frontend` directory and run:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
2.  To clear Vite’s cache, you can add the `--force` flag:
    ```bash
    npm run dev -- --force
    ```

### Step 9: Test the Application

Verify that the application runs without errors and all functionalities work as expected.

**Action:**

1.  Open a browser and navigate to `http://localhost:5173` (or the port specified by Vite).
2.  Check the browser console for errors.
3.  Test features like directory navigation, file creation, deletion, and visibility toggling.

## Troubleshooting

If issues persist, consider the following:

| Issue | Possible Cause | Solution |
| :--- | :--- | :--- |
| Module not found errors | Incorrect path aliases | Verify `@` and `@shared/*` aliases in `vite.config.ts` and `tsconfig.json`. |
| Syntax errors in `directoryUtils.ts` | Residual duplicate exports or incorrect imports | Ensure the corrected `directoryUtils.ts` is used and imports omit `.js` extensions. |
| Hot Module Replacement (HMR) not working | Vite configuration issues | Check Vite documentation for HMR settings ([Vite HMR](https://vitejs.dev/guide/features.html#hot-module-replacement)). |
| Backend API errors | Backend not running | Confirm the backend server is running on `http://localhost:8000`. |
| Environment variables not loading | Missing or incorrect `.env` file | Verify the `.env` file exists and contains the correct keys. |

## Performance Considerations

*   **Development Server Startup:** Allowing access to the parent directory (`fs.allow: ['..']`) may slightly increase startup time due to a larger file system scope. This does not affect production builds.
*   **Build Performance:** The corrected configuration should not impact production build times, as Vite optimizes for production separately.

## Security Implications

*   **Development Environment:** Setting `fs.allow: ['..']` is generally safe for development but exposes the parent directory. For added security, consider restricting access to specific directories, e.g., `fs.allow: ['../shared']`.
*   **Production Environment:** Ensure sensitive files are not exposed in production builds. Use Vite’s production configuration to limit file access ([Vite Configuration](https://vitejs.dev/config/)).

## Prevention Strategies

To avoid similar issues in the future:

*   **Automated Linting:** Use ESLint with TypeScript plugins to catch syntax errors early.
*   **TypeScript Strict Mode:** Enable `strict` mode in `tsconfig.json` to enforce type safety.
*   **Monorepo Tools:** Consider tools like Nx or Turborepo for better dependency management and shared configurations ([Nx](https://nx.dev/), [Turborepo](https://turbo.build/repo)).
*   **Incremental Development:** Make small changes and test frequently to isolate issues.
*   **Documentation:** Maintain clear documentation for monorepo setups and configurations.

## Alternative Solutions

*   **Monorepo Tools:** Use Nx or Turborepo to streamline monorepo management, including shared Vite configurations ([HackerNoon: Monorepo with Vite](https://hackernoon.com/how-to-set-up-a-monorepo-with-vite-and-npm-workspaces)).
*   **Shared Package:** Restructure the `shared` directory as an npm package to simplify imports and dependency management.
*   **Vite Config Loader:** If TypeScript issues persist in the Vite config, use `--configLoader` runner to avoid bundling issues ([Vite Config](https://vitejs.dev/config/#config-file)).

## Verification Checklist

*   [ ] `vite.config.ts` updated with `fs.allow` and correct aliases.
*   [ ] `frontend/tsconfig.json` includes matching path aliases.
*   [ ] Corrected `directoryUtils.ts` is in place.
*   [ ] Import statements in `Workspace.tsx` use `@shared`.
*   [ ] `.env` file created with necessary variables.
*   [ ] Dependencies installed in `frontend` and `backend`.
*   [ ] Backend server running on `http://localhost:8000`.
*   [ ] Frontend server running without errors.
*   [ ] Application loads and functions correctly in the browser.

## Conclusion

This guide resolves the module loading error by correcting Vite’s configuration, ensuring proper import statements, and using fixed utility files. By following these steps, your application should be back up and running. The troubleshooting, performance, security, and prevention strategies provided will help maintain a robust development workflow. For further reading, consult the Vite documentation and monorepo setup guides ([Vite Documentation](https://vitejs.dev/guide/), [Stack Overflow: Vite Monorepo](https://stackoverflow.com/questions/67297129/vite-monorepo-setup-with-shared-ui-package)).
