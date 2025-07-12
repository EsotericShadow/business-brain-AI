# Transition Plan: 06 - AI Service Abstraction

This document outlines the plan to refactor the AI integration, decoupling it from the `@google/generative-ai` library and creating a provider-agnostic abstraction layer.

## 1. Rationale

The current backend directly interacts with the Google Gemini API in its routes and services. This creates vendor lock-in. By creating a generic, internal AI service, we can easily swap or add other AI models (e.g., from OpenAI, Anthropic) in the future with minimal disruption to the rest of the application.

## 2. The Abstraction Layer: `ai.service.ts`

A new service will be created at `backend/src/services/ai.service.ts`. This service will act as a single point of contact for all AI-related operations.

### 2.1. Generic Interfaces

The service will define a set of generic interfaces that are not tied to any specific provider.

```typescript
// In a new file: shared/types/ai.ts

export interface AICompletionRequest {
  model?: string; // e.g., 'default-text', 'default-functions'
  prompt: string;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  tools?: any[]; // A generic representation of function declarations
  systemInstruction?: string;
}

export interface AICompletionResponse {
  type: 'text' | 'function_call';
  content?: string;
  functionCall?: {
    name: string;
    args: any;
  };
}
```

### 2.2. The `AIService` Class

The new service will implement methods that use these generic interfaces.

```typescript
// In backend/src/services/ai.service.ts

import { GoogleAIProvider } from './ai-providers/google.provider.ts';
import { AICompletionRequest, AICompletionResponse } from '@shared/types/ai';

// A map to hold different AI providers
const providers = {
  'google': new GoogleAIProvider(),
  // 'openai': new OpenAIProvider(), // Future provider
};

export class AIService {
  // The core method that all other services will call
  public async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    // For now, we can hardcode the provider.
    // In the future, this could be determined by the request.model or user settings.
    const provider = providers['google'];
    
    // The provider is responsible for translating the generic request
    // into a provider-specific API call and returning a generic response.
    return provider.generateCompletion(request);
  }
}
```

## 3. Provider-Specific Implementation

The actual API calls will be handled by provider-specific classes, which will be kept in a new `backend/src/services/ai-providers/` directory.

### `google.provider.ts`

This file will contain all the logic currently in `ai-gmail.service.ts` and `gemini.ts` that directly relates to the `@google/generative-ai` library.

-   It will have a `generateCompletion` method that takes our generic `AICompletionRequest`.
-   It will be responsible for translating our generic request format into the specific format expected by the Google Gemini API.
-   It will call the Gemini API and then transform the response back into our generic `AICompletionResponse` format.

## 4. Refactoring Existing Code

Once the abstraction layer is in place, the existing code must be refactored to use it.

-   **`backend/src/routes/gemini.ts`:** This route will no longer interact with `@google/generative-ai` directly. Instead, it will instantiate `AIService` and call `aiService.getCompletion()`.
-   **`backend/src/services/ai-gmail.service.ts`:** This service will also be updated to use the new `AIService` for all its AI-powered features (like summarizing or drafting emails). It will pass its function definitions in the generic `tools` format.

## 5. Benefits

-   **Flexibility:** To add a new AI provider (e.g., OpenAI), we would only need to create a new `openai.provider.ts` file and add it to the `providers` map in `ai.service.ts`. No other part of the application would need to change.
-   **Centralized Logic:** All AI-related configuration and API calls are centralized, making the system easier to maintain and debug.
-   **Testability:** The `AIService` can be easily mocked in unit tests, allowing for testing of AI-dependent features without making actual API calls.
