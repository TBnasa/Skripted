'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ChatPanel from '@/components/ChatPanel';
import EditorPanel from '@/components/EditorPanel';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from '@/lib/useTranslation';
import type { ChatMessage, FeedbackPayload } from '@/types';

export default function Page() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [editorCode, setEditorCode] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const pineconeIdsRef = useRef<string[]>([]);
  const sessionIdRef = useRef(crypto.randomUUID());
  const lastPromptRef = useRef('');

  /**
   * Safe UUID generation with fallback for non-secure contexts.
   */
  const generateId = useCallback(() => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  }, []);

  /**
   * Extract code blocks (```vb ... ``` or ``` ... ```) from AI response.
   */
  const extractCode = useCallback((text: string): string => {
    const codeBlockRegex = /```(?:vb|sk|skript)?\n?([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }

    return blocks.join('\n\n');
  }, []);

  /**
   * Send a message and stream the AI response. Includes Self-Healing logic.
   */
  const handleNewMessage = useCallback(
    async (content: string) => {
      lastPromptRef.current = content;
      setShowFeedback(false);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');
      setStreamingReasoning('');

      try {
        console.log('[Chat] Starting request to /api/chat...');
        
        let currentHistory: ChatMessage[] = [];
        setMessages(prev => {
          currentHistory = prev.slice(-11);
          return prev;
        });

        const fetchChat = async (prompt: string, history: ChatMessage[]) => {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, history }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || `Status: ${response.status}`);
          }
          return response;
        };

        const streamResponse = async (response: Response) => {
          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response stream');

          const decoder = new TextDecoder();
          let fullContent = '';
          let fullReasoning = '';
          let buffer = '';

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
                } else if (parsed.type === 'reasoning') {
                  fullReasoning += parsed.content;
                  setStreamingReasoning(fullReasoning);
                } else if (parsed.type === 'content') {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
              } catch (e) {}
            }
          }
          return { fullContent, fullReasoning };
        };

        let initialResponse = await fetchChat(content, currentHistory.slice(0, -1));
        let { fullContent, fullReasoning } = await streamResponse(initialResponse);

        // --- SELF-HEALING ENGINE ---
        const initialCode = extractCode(fullContent);
        if (initialCode) {
          console.log('[Self-Healing] Verifying initial code...');
          const verifyRes = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: initialCode }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.status !== 'Safe' && verifyData.issues?.length > 0) {
            console.log('[Self-Healing] Issues detected, triggering autonomous correction...');
            setStreamingContent(prev => prev + '\n\n*(Self-healing in progress...)*');
            
            const correctionPrompt = `The previous code you generated has errors. Please fix them immediately. Use JetBrains Mono style logic.\n\nErrors detected:\n${verifyData.issues.map((i: any) => `- ${i.message}`).join('\n')}\n\nCode to fix:\n\`\`\`sk\n${initialCode}\n\`\`\``;
            
            const fixedResponse = await fetchChat(correctionPrompt, [...currentHistory, { 
              id: 'temp', role: 'assistant', content: fullContent, timestamp: Date.now() 
            }]);
            
            setStreamingContent(''); // Reset for fixed version
            const fixedData = await streamResponse(fixedResponse);
            fullContent = fixedData.fullContent;
            fullReasoning = fixedData.fullReasoning;
          }
        }
        // --- END SELF-HEALING ---

        const finalAssistantContent = fullContent + '\n\n' + t('code_verified');

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: finalAssistantContent,
          reasoning: fullReasoning,
          timestamp: Date.now(),
          codeBlock: extractCode(finalAssistantContent),
          pineconeIds: [...pineconeIdsRef.current],
        };

        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              title: newMessages[0]?.content.substring(0, 40) || 'New Chat',
              messages: newMessages,
            }),
          }).catch(err => console.error('[Session] Sync failed:', err));
          return newMessages;
        });

        const code = extractCode(finalAssistantContent);
        if (code) {
          setEditorCode(code);
          setShowFeedback(true);
        }
      } catch (error) {
        console.error('[Chat] Error:', error);
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: `⚠️ Bir hata oluştu. Hata: ${error instanceof Error ? error.message : 'Bilinmiyor'}`,
          timestamp: Date.now(),
        }]);
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        setStreamingReasoning('');
      }
    },
    [generateId, extractCode, t],
  );

  const handleFeedback = useCallback(
    async (success: boolean, errorLog?: string) => {
      const payload: FeedbackPayload = {
        sessionId: sessionIdRef.current,
        prompt: lastPromptRef.current,
        generatedCode: editorCode,
        success,
        errorLog,
        pineconeIds: [...pineconeIdsRef.current],
      };

      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('[Feedback] Error:', error);
      }

      setShowFeedback(false);
    },
    [editorCode],
  );

  const handleCodeExtracted = useCallback((code: string) => {
    setEditorCode(code);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save action
        console.log('Saved to Supabase mock');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Trigger code analysis (if custom logic goes here) or focus input
        console.log('Code analyzed');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search/chat
        console.log('Search opened');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setEditorCode('');
    lastPromptRef.current = '';
    sessionIdRef.current = generateId();
  }, [generateId]);

  return (
    <div className="flex h-screen max-h-screen flex-col pt-16 overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="flex flex-1 overflow-hidden min-h-0 flex-row">
        {/* Sidebar */}
        <Sidebar onNewChat={handleNewChat} history={[]} />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Terminal (Chat) - 55% Width */}
          <div className="flex w-full flex-col border-r border-[var(--color-border)] md:w-[55%] lg:w-[55%] flex-shrink-0">
            <ChatPanel
              messages={messages}
              onNewMessage={handleNewMessage}
              onCodeExtracted={handleCodeExtracted}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              streamingReasoning={streamingReasoning}
              onFeedback={handleFeedback}
              showFeedback={showFeedback}
            />
          </div>

          {/* Editor - 45% Width */}
          <div className="hidden flex-1 flex-col md:flex md:w-[45%] lg:w-[45%] min-w-0">
            <EditorPanel
              code={editorCode}
              onCodeChange={setEditorCode}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2 md:hidden">
        {editorCode.trim() ? (
          <details className="group">
            <summary className="cursor-pointer rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
              📝 Kod Önizleme ({editorCode.split('\n').length} satır)
            </summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[var(--color-bg-primary)] p-4 font-[var(--font-mono)] text-xs text-[var(--color-text-primary)]">
              <code>{editorCode}</code>
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}
