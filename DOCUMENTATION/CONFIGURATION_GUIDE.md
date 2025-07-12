# Configuration Guide

This document explains the purpose and key settings of the various configuration files (`*.json`, `*.js`, `*.ts`) across the project.

---

## 1. Root Configuration

These files are in the project's root directory.

### `vite.config.ts`

*   **Purpose:** Configures the Vite development server, which serves the frontend.
*   **Key Settings:**
    *   `server.proxy`: This is the most critical setting. It proxies any request from the frontend to a path starting with `/api` (e.g., `/api/me`) to the backend server running on `http://localhost:8000`. This avoids CORS issues during development.
    *   `resolve.alias`: Sets up a path alias so that `@/` resolves to the project's root directory. This is used for cleaner import paths in the frontend code.

### `tsconfig.base.json` / `tsconfig.json`

*   **Purpose:** These files define the base TypeScript settings for the entire project. The `tsconfig.json` in the root extends the `tsconfig.base.json`.
*   **Key Settings:**
    *   `compilerOptions.paths`: This is where the `@/*` path alias is officially registered for TypeScript to understand.
    *   `include`: Specifies which files are part of the root TypeScript project.

---

## 2. Backend Configuration (`backend/`)

### `tsconfig.json`

*   **Purpose:** Contains the TypeScript compiler options specifically for the backend server.
*   **Key Settings:**
    *   `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`: These are modern settings that tell TypeScript to use standard ECMAScript modules (ESM) instead of CommonJS. This is the direct cause of the TypeScript errors documented in `ERRORS/TYPESCRIPT_ISSUES.md`, as it requires explicit file extensions (e.g., `./file.js`) in relative imports.
    *   `"rootDir": "."`: Defines the root of the backend source files.
    *   `"include": ["src/**/*", "../shared/**/*"]`: This setting attempts to include the shared directory, but because `../shared` is outside the `rootDir`, it causes a configuration error (also documented in the error report).

### `package.json`

*   **Purpose:** Defines the backend's dependencies and scripts.
*   **Key Settings:**
    *   `"type": "module"`: This is crucial. It tells Node.js to treat all `.js` files in the backend directory as ECMAScript modules, aligning with the TypeScript configuration.
    *   `"scripts"`:
        *   `"dev": "tsx watch src/index.ts"`: The development script. It uses `tsx` (a TypeScript execution environment) to run and watch the `index.ts` file for changes, providing hot-reloading capabilities for the server.
        *   `"build": "tsc"`: The production build script. It invokes the TypeScript compiler (`tsc`) to transpile all `.ts` files into `.js` files in a `dist` directory.
        *   `"start": "node dist/index.js"`: The production start script. It runs the compiled JavaScript output.

---

## 3. Frontend Configuration (`frontend/`)

### `tsconfig.json`

*   **Purpose:** Contains the TypeScript compiler options for the React frontend.
*   **Key Settings:**
    *   `"jsx": "react-jsx"`: The standard setting for modern React projects.
    *   `"paths"`: Correctly inherits the `@/*` path alias from the root `tsconfig.json`.

### `package.json`

*   **Purpose:** Defines the frontend's dependencies and scripts.
*   **Key Settings:**
    *   `"scripts"`:
        *   `"dev": "vite"`: Runs the Vite development server.
        *   `"build": "vite build"`: Bundles the React application for production.
        *   `"preview": "vite preview"`: Serves the production build locally for testing.

### `eslint.config.js`

*   **Purpose:** Configures ESLint for code quality and style checking for the frontend codebase.
