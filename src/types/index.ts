/* ═══════════════════════════════════════════
   Skripted — Shared TypeScript Interfaces
   ═══════════════════════════════════════════ */

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly reasoning?: string;
  readonly timestamp: number;
  readonly codeBlock?: string;
  readonly pineconeIds?: readonly string[];
}

export interface AnalysisResult {
  readonly score: number;
  readonly category: 'Syntax' | 'Logic' | 'Optimization' | 'None';
  readonly feedback?: string;
  readonly syntax?: readonly string[];
  readonly logic?: readonly string[];
  readonly performance?: readonly string[];
}

export interface DashboardStats {
  totalAnalyzed: number;
  averageScore: number;
  commonError: string;
  totalScore: number;
}

export interface AnalysisHistoryItem {
  id: string;
  title: string;
  score: number;
  category: string;
  timestamp: number;
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
  readonly addons?: readonly string[];
  readonly currentCode?: string;
  readonly lang: 'tr' | 'en';
  readonly serverVersion?: string;
  readonly serverType?: string;
  readonly skriptVersion?: string;
}

export interface SupportFeedback {
  readonly email: string;
  readonly message: string;
}

export type FeedbackPayload = 
  | {
      readonly sessionId: string;
      readonly prompt: string;
      readonly generatedCode: string;
      readonly success: boolean;
      readonly errorLog?: string;
      readonly consoleOutput?: string;
      readonly pineconeIds?: readonly string[];
    }
  | SupportFeedback;

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
