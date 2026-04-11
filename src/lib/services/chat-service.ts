import { searchSkriptExamples, formatRAGContext } from '@/lib/pinecone';
import { buildSystemPrompt } from '@/lib/system-prompt';

export class ChatService {
  static async prepareChatContext(prompt: string, config: {
    serverVersion?: string;
    serverType?: string;
    skriptVersion?: string;
    addons?: string[];
  }) {
    let pineconeIds: string[] = [];
    let ragContext = '';

    try {
      const searchPromise = searchSkriptExamples(prompt.trim());
      const timeoutPromise = new Promise<[]>((resolve) => setTimeout(() => resolve([]), 5000));
      
      const examples = await Promise.race([searchPromise, timeoutPromise]);
      ragContext = formatRAGContext(examples);
      pineconeIds = examples.map((ex) => ex.id);
    } catch (e) {
      console.error('[Pinecone RAG Error]:', e);
    }

    const systemPrompt = buildSystemPrompt(
      config.serverVersion,
      config.serverType,
      config.skriptVersion,
      ragContext,
      config.addons
    );

    return { systemPrompt, pineconeIds };
  }

  static truncateHistory(history: any[], maxHistory = 6, maxMsgChars = 500) {
    return history.slice(-maxHistory).map((msg) => {
      let content = msg.content;
      if (content.length > maxMsgChars) {
        content = content.substring(0, maxMsgChars) + '\n...[truncated]';
      }
      return {
        role: msg.role as 'user' | 'assistant',
        content,
      };
    });
  }
}
