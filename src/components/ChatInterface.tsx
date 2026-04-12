'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ChatPanel from '@/components/ChatPanel';
import EditorPanel from '@/components/EditorPanel';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from '@/lib/useTranslation';
import type { ChatMessage, FeedbackPayload } from '@/types';

export default function ChatInterface() {
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

  const generateId = useCallback(() => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  }, []);

  const extractCode = useCallback((text: string): string => {
    const codeBlockRegex = /```(?:vb|sk|skript)?\n?([\s\S]*?)```/g;
    const blocks: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }

    return blocks.join('\n\n');
  }, []);

  const handleLoadChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) {
        console.error('[LoadChat] Failed to load chat:', res.status);
        return;
      }

      const chat = await res.json();
      sessionIdRef.current = chat.id;

      const loadedMessages: ChatMessage[] = Array.isArray(chat.content) ? chat.content : [];
      setMessages(loadedMessages);

      const lastAssistant = [...loadedMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        const code = extractCode(lastAssistant.content);
        setEditorCode(code);
      } else {
        setEditorCode('');
      }

      setShowFeedback(false);
    } catch (err) {
      console.error('[LoadChat] Error:', err);
    }
  }, [extractCode]);

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
        let currentHistory: ChatMessage[] = [];
        setMessages(prev => {
          currentHistory = prev.slice(-11);
          return prev;
        });

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content, history: currentHistory.slice(0, -1), addons, currentCode: editorCode }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || `Status: ${response.status}`);
        }

        setIsAnalyzing(false);
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
          .then(() => setSidebarRefreshKey(k => k + 1));
          return newMessages;
        });

        const code = extractCode(finalAssistantContent);
        if (code) {
          setEditorCode(code);
          setShowFeedback(true);
        }
      } catch (error) {
        setIsAnalyzing(false);
        setGlobalError(error instanceof Error ? error.message : 'Sohbet sırasında beklenmeyen bir hata oluştu.');
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        setStreamingReasoning('');
      }
    },
    [generateId, extractCode, editorCode],
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
      } catch (error) {}

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
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
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
      {globalError && (
        <div className="absolute top-16 left-0 right-0 z-50 p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-mono text-center flex items-center justify-center gap-2">
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-2 hover:text-red-300">
            X
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0 flex-row">
        <Sidebar
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          activeChatId={sessionIdRef.current}
          refreshKey={sidebarRefreshKey}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
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

          <div className="hidden flex-1 flex-col md:flex md:w-[45%] lg:w-[45%] min-w-0">
            <EditorPanel
              code={editorCode}
              onCodeChange={setEditorCode}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
