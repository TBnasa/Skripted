import { searchSkriptExamples, formatRAGContext } from '@/lib/pinecone';
import { buildSystemPrompt } from '@/lib/system-prompt';
import { AppError } from '@/lib/errors';

export interface ChatConfig {
  serverVersion?: string;
  serverType?: string;
  skriptVersion?: string;
  addons?: string[];
  lang?: string;
  userTier?: string;
}

export interface TruncatedMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ChatService handles the orchestration of chat context preparation,
 * including RAG (Retrieval-Augmented Generation) and system prompt construction.
 */
export class ChatService {
  private static readonly RAG_TIMEOUT_MS = 5000;
  private static readonly MAX_HISTORY_DEFAULT = 6;
  private static readonly MAX_MSG_CHARS_DEFAULT = 500;

  /**
   * Prepares the system prompt and associated RAG context for a chat request.
   */
  static async prepareChatContext(prompt: string, config: ChatConfig) {
    let pineconeIds: string[] = [];
    let ragContext = '';

    try {
      const searchPromise = searchSkriptExamples(prompt.trim());
      const timeoutPromise = new Promise<[]>((resolve) => 
        setTimeout(() => resolve([]), this.RAG_TIMEOUT_MS)
      );
      
      const examples = await Promise.race([searchPromise, timeoutPromise]);
      ragContext = formatRAGContext(examples);
      pineconeIds = examples.map((ex) => ex.id);
    } catch (e) {
      // Log but don't fail the entire request if RAG fails
      console.error('[Pinecone RAG Error]:', e);
    }

    const systemPrompt = buildSystemPrompt(
      config.serverVersion,
      config.serverType,
      config.skriptVersion,
      ragContext,
      config.addons,
      config.lang,
      config.userTier
    );

    return { systemPrompt, pineconeIds };
  }

  /**
   * Truncates message history to manage token limits and focus the model's context.
   */
  static truncateHistory(
    history: any[], 
    maxHistory = this.MAX_HISTORY_DEFAULT, 
    maxMsgChars = this.MAX_MSG_CHARS_DEFAULT
  ): TruncatedMessage[] {
    if (!Array.isArray(history)) {
      throw AppError.validation('History must be an array');
    }

    return history.slice(-maxHistory).map((msg) => {
      let content = String(msg.content || '');
      if (content.length > maxMsgChars) {
        content = content.substring(0, maxMsgChars) + '\n...[truncated]';
      }
      
      return {
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content,
      };
    });
  }
}
