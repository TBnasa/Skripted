import { useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import type { ChatMessage } from '@/types';
import { extractCode as sharedExtractCode } from '@/lib/utils/code-extractor';

export interface UseSkriptAnalysisOptions {
  onComplete?: () => void;
}

export function useSkriptAnalysis(options?: UseSkriptAnalysisOptions) {
  const { 
    messages, 
    addMessage, 
    setMessages,
    editorCode, 
    setEditorCode,
    setIsStreaming, 
    setIsAnalyzing, 
    setGlobalError,
    sessionId,
    updateStats,
    addHistoryItem,
    updateMessage
  } = useStore();

  const pineconeIdsRef = useRef<string[]>([]);
  const lastPromptRef = useRef('');

  const generateId = useCallback(() => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  }, []);

  // We use the shared extractor instead of a local one to ensure consistency
  const extractCode = useCallback((text: string): string => {
    return sharedExtractCode(text);
  }, []);

  const parsePerformanceScore = (content: string): { score: number | null, category: string } => {
    try {
      const match = content.match(/\[FINAL_ANALYSIS\]:\s*(?:```json\n?)?(\{[\s\S]*?\})(?:\n?```)?/i);
      if (match) {
        const data = JSON.parse(match[1].replace(/```json\n?|```/g, '').trim());
        let category = 'None';
        if (data.syntax?.length > 0) category = 'Syntax';
        else if (data.logic?.length > 0) category = 'Logic';
        else if (data.performance?.length > 0) category = 'Optimization';
        
        return { 
          score: typeof data.score === 'number' ? data.score : null,
          category
        };
      }
      return { score: null, category: 'None' };
    } catch {
      return { score: null, category: 'None' };
    }
  };

  const handleNewMessage = useCallback(async (content: string, addons: string[] = []) => {
    lastPromptRef.current = content;
    setGlobalError(null);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setIsStreaming(true);
    setIsAnalyzing(true);

    try {
      const trChars = /[ışğüöçİŞĞÜÖÇ]/;
      const commonTrWords = /\b(merhaba|selam|nasılsın|yap|et|olsun|nasıl|nedir|ekle|sil|ayarla|mesaj)\b/i;
      const activeLang = (trChars.test(content) || commonTrWords.test(content)) ? 'tr' : 'en';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          history: messages.slice(-10),
          sessionId,
          addons,
          currentCode: editorCode,
          lang: activeLang,
          skriptVersion: 'Latest (2.9)'
        }),
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      setIsAnalyzing(false);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let fullReasoning = '';
      let buffer = '';

      const assistantId = generateId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        reasoning: '',
        timestamp: Date.now(),
        pineconeIds: [],
      };

      addMessage(assistantMessage);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'meta' && parsed.pineconeIds) {
              pineconeIdsRef.current = parsed.pineconeIds;
              updateMessage(assistantId, { pineconeIds: [...parsed.pineconeIds] });
            } else if (parsed.type === 'reasoning') {
              fullReasoning += parsed.content;
              updateMessage(assistantId, { reasoning: fullReasoning });
            } else if (parsed.type === 'content') {
              fullContent += parsed.content;
              updateMessage(assistantId, { content: fullContent });
            }
          } catch (e) {}
        }
      }

      // Final update with code blocks and other meta-data
      updateMessage(assistantId, {
        content: fullContent,
        reasoning: fullReasoning,
        codeBlock: extractCode(fullContent),
      });

      const { score, category } = parsePerformanceScore(fullContent);
      if (score !== null) {
        updateStats(score, category);
        addHistoryItem({
          id: generateId(),
          title: content.substring(0, 40),
          score,
          category,
          timestamp: Date.now()
        });
      }

      const code = extractCode(fullContent);
      if (code) setEditorCode(code);

      // Trigger sidebar refresh
      if (options?.onComplete) {
        options.onComplete();
      }

    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Error occurred');
    } finally {
      setIsStreaming(false);
      setIsAnalyzing(false);
    }
  }, [messages, editorCode, addMessage, updateMessage, setIsStreaming, setIsAnalyzing, setGlobalError, generateId, extractCode, updateStats, addHistoryItem, setEditorCode, options]);

  return { handleNewMessage };
}
