# TypeScript Error Report

This document provides a comprehensive breakdown of all known TypeScript errors in the `backend` codebase. The errors are categorized by their type for clarity and to assist developers in addressing them systematically.

---

## 1. Configuration Errors (`tsconfig.json`)

These errors stem from the TypeScript configuration in `backend/tsconfig.json` and primarily relate to how the project is structured with a shared directory.

### Error Details

*   **File:** `/backend/tsconfig.json`
*   **Error Codes:** `TS1005` (generic)
*   **Message:**
    > File '/shared/types/index.ts' is not under 'rootDir' '/backend'. 'rootDir' is expected to contain all source files.
    > File '/shared/utils/directoryUtils.ts' is not under 'rootDir' '/backend'.
    > File '/shared/utils/initialData.ts' is not under 'rootDir' '/backend'.

### Analysis

The `backend` project's `tsconfig.json` defines its root directory as `backend/`. However, it also includes files from the `../shared/` directory. TypeScript requires all compiled files to be located under a single root directory. This configuration violates that rule, causing these errors.

**Suggested Action:** A developer should investigate monorepo setup best practices, such as using TypeScript Project References or adjusting the `rootDir` and `rootDirs` options in `tsconfig.json` to correctly include the `shared` directory.

---

## 2. Module Resolution & Import Errors

This is the most common category of errors, caused by a mismatch between the ES Module standards and the import paths used in the code. The `tsconfig.json` likely specifies `"moduleResolution": "node16"` or `"nodenext"`, which enforces these modern standards.

### Error Details

*   **Files:**
    *   `/backend/src/index.ts`
    *   `/backend/src/routes/gmail.ts`
    *   `/backend/src/services/ai-gmail.service.ts`
*   **Error Codes:** `TS2835`, `TS2307`
*   **Messages:**
    > Relative import paths need explicit file extensions... Did you mean './config/environment.js'?
    > Cannot find module '../services/ai-gmail.service' or its corresponding type declarations.
    > Cannot find module '@shared/types' or its corresponding type declarations.

### Analysis

1.  **Missing File Extensions:** Relative imports (e.g., `from './db'`) must include the `.js` extension (e.g., `from './db.js'`) because in the final JavaScript output, that is the file that will be loaded.
2.  **Unresolved Path Aliases:** The import `from '@shared/types'` is failing. This indicates that the path alias `'@shared/*'` is not correctly configured in the `tsconfig.json`'s `paths` option for the backend project.

**Suggested Action:** A developer needs to update all relative import paths to include the `.js` extension and correctly configure the `paths` in `tsconfig.json` to resolve the `@shared` alias.

---

## 3. Type Compatibility & Mismatch Errors

These are classic TypeScript errors where the shape of data does not match the type definition expected by a function or variable.

### Error Details

*   **File:** `/backend/src/services/ai-gmail.service.ts`
    *   **L15, C17 (`TS2322`):** The object provided to `getGenerativeModel` is not assignable to `FunctionDeclaration[]`. The `parameters.type` property is a generic `string` but the SDK expects the more specific `SchemaType` enum.
*   **File:** `/backend/src/index.ts`
    *   **L116, C41 (`TS2345`):** An argument passed to `findOrCreateUser` is missing the `id` property. The code provides `{ sub, email, name, picture }` but the function expects `{ id, email, name, picture }`.

### Analysis

1.  **Incorrect SDK Typing:** The function definitions for the Gemini API are not using the correct `SchemaType` enum from the `@google/generative-ai` package for the `type` property of function parameters.
2.  **Object Shape Mismatch:** The `findOrCreateUser` function is being called with a `googleProfile` object that has a `sub` property instead of the required `id` property.

**Suggested Action:** A developer must correct the types in the `getFunctionDefinitions` array in `ai-gmail.service.ts` and ensure the object passed to `findOrCreateUser` in `index.ts` has the correct shape, likely by mapping `sub` to `id`.

---

## 4. Implicit `any` Type Errors

These errors occur because function parameters have not been given an explicit type, and TypeScript is defaulting them to `any`, which is unsafe.

### Error Details

*   **File:** `/backend/src/services/ai-gmail.service.ts`
*   **Error Code:** `TS7006`
*   **Locations:**
    *   L184, C36: Parameter `h`
    *   L185, C39: Parameter `h`
    *   L186, C36: Parameter `h`
    *   L218, C34: Parameter `h`
    *   L219, C32: Parameter `h`
    *   L220, C37: Parameter `h`
    *   L221, C34: Parameter `h`

### Analysis

In multiple `.find()` calls on email headers, the parameter `h` in the callback function `(h) => ...` is not typed.

**Suggested Action:** A developer should add an explicit type to the `h` parameter. Based on the context of the `googleapis` library, the type should likely be `{ name: string; value: string; }` or a similar interface representing an email header.
