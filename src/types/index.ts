/* ═══════════════════════════════════════════
   Skripted — Shared TypeScript Interfaces
   ═══════════════════════════════════════════ */

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: number;
  readonly codeBlock?: string;
  readonly pineconeIds?: readonly string[];
}

export interface ChatSession {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly ChatMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SkriptExample {
  readonly id: string;
  readonly text: string;
  readonly title?: string;
  readonly version?: string;
  readonly quality?: string;
  readonly addonRequired?: string;
  readonly score?: number;
}

export interface RAGContext {
  readonly examples: readonly SkriptExample[];
  readonly queryTime: number;
}

export interface ChatRequest {
  readonly prompt: string;
  readonly history: readonly ChatMessage[];
  readonly serverVersion?: string;
  readonly serverType?: string;
  readonly skriptVersion?: string;
}

export interface FeedbackPayload {
  readonly sessionId: string;
  readonly prompt: string;
  readonly generatedCode: string;
  readonly success: boolean;
  readonly errorLog?: string;
  readonly consoleOutput?: string;
  readonly pineconeIds?: readonly string[];
}

export interface UserProfile {
  readonly id: string;
  readonly displayName?: string;
  readonly defaultServerVersion: string;
  readonly defaultServerType: string;
  readonly defaultSkriptVersion: string;
}

export interface SavedSnippet {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly code: string;
  readonly description?: string;
  readonly serverVersion: string;
  readonly serverType: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
}
