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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
   * Load a saved chat from database by its ID.
   */
  const handleLoadChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) {
        console.error('[LoadChat] Failed to load chat:', res.status);
        return;
      }

      const chat = await res.json();
      sessionIdRef.current = chat.id;

      // content is the messages array stored as JSONB
      const loadedMessages: ChatMessage[] = Array.isArray(chat.content) ? chat.content : [];
      setMessages(loadedMessages);

      // Restore editor code from last assistant message
      const lastAssistant = [...loadedMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        const code = extractCode(lastAssistant.content);
        setEditorCode(code);
      } else {
        setEditorCode('');
      }

      setShowFeedback(false);
      console.log(`[LoadChat] Loaded chat "${chat.title}" with ${loadedMessages.length} messages`);
    } catch (err) {
      console.error('[LoadChat] Error:', err);
    }
  }, [extractCode]);

  /**
   * Send a message and stream the AI response.
   */
  const handleNewMessage = useCallback(
    async (content: string, addons: string[] = []) => {
      lastPromptRef.current = content;
      setShowFeedback(false);
      setGlobalError(null);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setIsAnalyzing(true);
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
            body: JSON.stringify({ prompt, history, addons, currentCode: editorCode }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || `Status: ${response.status}`);
          }
          return response;
        };

        const streamResponse = async (response: Response) => {
          setIsAnalyzing(false); // Stop analyzing animation when stream starts
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

        const finalAssistantContent = fullContent;

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
          })
          .then(() => {
            // Refresh sidebar after saving
            setSidebarRefreshKey(k => k + 1);
          })
          .catch(err => console.error('[Session] Sync failed:', err));
          return newMessages;
        });

        const code = extractCode(finalAssistantContent);
        if (code) {
          setEditorCode(code);
          setShowFeedback(true);
        }
      } catch (error) {
        console.error('[Chat] Stream error:', error);
        setIsAnalyzing(false);
        setGlobalError(error instanceof Error ? error.message : 'Sohbet sırasında beklenmeyen bir hata oluştu.');
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: last.content + '\n\n**[Bağlantı Kesildi veya Hata Oluştu]**' }];
          }
          return prev;
        });
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

  const manualSave = useCallback(async () => {
    if (messages.length === 0) return;
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          title: messages[0]?.content.substring(0, 40) || 'Manual Saved Chat',
          messages: messages,
        }),
      });
      setSidebarRefreshKey(k => k + 1);
      console.log('Saved to Supabase');
    } catch (e) {
      console.error('Error saving', e);
    }
  }, [messages]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
        console.log('Premium Logic: Saved to Cloud');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Trigger code analysis
        console.log('Supabase MCP: Code Analysis Triggered');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search/chat
        console.log('Search opened');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualSave]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setEditorCode('');
    lastPromptRef.current = '';
    sessionIdRef.current = generateId();
  }, [generateId]);

  return (
    <div className="flex h-screen max-h-screen flex-col pt-16 overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Global Error Banner */}
      {globalError && (
        <div className="absolute top-16 left-0 right-0 z-50 p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-mono text-center flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-2 hover:text-red-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0 flex-row">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="fixed top-[1.125rem] left-4 z-50 p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:hidden transition-all"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Sidebar */}
        <Sidebar
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          activeChatId={sessionIdRef.current}
          refreshKey={sidebarRefreshKey}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Terminal (Chat) - 55% Width */}
          <div className="flex w-full flex-col border-r border-white/[0.04] md:w-[55%] lg:w-[55%] flex-shrink-0">
            <ChatPanel
              messages={messages}
              onNewMessage={handleNewMessage}
              onCodeExtracted={handleCodeExtracted}
              isStreaming={isStreaming}
              isAnalyzing={isAnalyzing}
              streamingContent={streamingContent}
              streamingReasoning={streamingReasoning}
              onFeedback={handleFeedback}
              showFeedback={showFeedback}
            />
          </div>

          {/* Editor - 45% Width (desktop only) */}
          <div className="hidden flex-1 flex-col md:flex md:w-[45%] lg:w-[45%] min-w-0">
            <EditorPanel
              code={editorCode}
              onCodeChange={setEditorCode}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>

      {/* Mobile Code Preview (read-only with copy) */}
      {editorCode.trim() ? (
        <div className="border-t border-white/[0.04] bg-[#0e0e0e] p-3 md:hidden">
          <details className="group">
            <summary className="cursor-pointer rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] flex items-center justify-between">
              <span>📝 Kod Önizleme ({editorCode.split('\n').length} satır)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="mt-2 relative">
              <button
                onClick={() => { navigator.clipboard.writeText(editorCode); }}
                className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] font-medium text-[var(--color-text-muted)] hover:text-emerald-400 transition-colors"
                aria-label="Copy code"
              >
                Kopyala
              </button>
              <pre className="max-h-64 overflow-auto rounded-xl bg-black/40 p-4 font-mono text-xs text-emerald-300/80 leading-relaxed border border-white/[0.04]">
                <code>{editorCode}</code>
              </pre>
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}
