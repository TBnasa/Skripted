/* ═══════════════════════════════════════════
   Skripted — Application Constants
   ═══════════════════════════════════════════ */

export const APP_NAME = 'Skripted' as const;
export const APP_DESCRIPTION = 'AI-Powered Minecraft Skript Generation' as const;
export const APP_URL = 'https://skripted.dev' as const;

// OpenRouter
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions' as const;
export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-lite:free';

// Pinecone
export const PINECONE_INDEX = process.env.PINECONE_INDEX ?? 'skripted';
export const PINECONE_TOP_K = 3 as const;

// Skript defaults
export const DEFAULT_SERVER_VERSION = '1.21.1' as const;
export const DEFAULT_SERVER_TYPE = 'Paper' as const;
export const DEFAULT_SKRIPT_VERSION = '2.14.3' as const;

// UI
export const MAX_CHAT_HISTORY = 50 as const;
export const STREAMING_CHUNK_DELAY_MS = 0 as const;

// Rate limiting
export const MAX_REQUESTS_PER_MINUTE = 20 as const;
