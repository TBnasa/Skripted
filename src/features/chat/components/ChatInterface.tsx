'use client';

import { useCallback, useEffect, useState } from 'react';
import ChatPanel from '@/features/chat/components/ChatPanel';
import EditorPanel from '@/features/chat/components/EditorPanel';
import Sidebar from '@/features/shared/components/Sidebar';
import LimitModal from '@/features/shared/components/LimitModal';
import Overview from '@/features/shared/components/Dashboard/Overview';
import { useTranslation } from '@/lib/useTranslation';
import { useStore } from '@/store/useStore';
import { useSkriptAnalysis } from '@/features/shared/hooks/use-skript-analysis';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { extractCode } from '@/lib/utils/code-extractor';
import { useAuth } from '@clerk/nextjs';

export default function ChatInterface() {
  const { isLoaded, userId } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    messages,
    setMessages,
    editorCode,
    setEditorCode,
    isStreaming,
    isAnalyzing,
    globalError,
    setGlobalError,
    sessionId,
    setSessionId,
    resetChat
  } = useStore();

  const { handleNewMessage } = useSkriptAnalysis({
    onComplete: () => {
      // Refresh sidebar when a message session is potentially new
      setSidebarRefreshKey(k => k + 1);
      // Also invalidate React Query cache for chats
      queryClient.invalidateQueries({ queryKey: ['session-usage'] });
    }
  });
  
  const [mounted, setMounted] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) {
      window.location.href = '/login';
    }
  }, [isLoaded, userId]);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: usage, refetch: mutateUsage } = useQuery({
    queryKey: ['session-usage'],
    queryFn: () => fetcher('/api/session/usage'),
  });

  const handleLoadChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) return;

      const chat = await res.json();
      setSessionId(chat.id);
      const loadedMessages = Array.isArray(chat.content) ? chat.content : [];
      setMessages(loadedMessages);
      
      // Extract code from the last assistant message in the history
      const lastAssistant = [...loadedMessages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        const code = extractCode(lastAssistant.content);
        if (code) {
          setEditorCode(code);
        }
      }
    } catch (err) {
      console.error('[LoadChat] Error:', err);
    }
  }, [setMessages, setSessionId]);

  const handleFeedback = useCallback(async (success: boolean, errorLog?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          generatedCode: editorCode,
          success,
          errorLog
        }),
      });
    } catch (error) {}
  }, [sessionId, editorCode]);

  const manualSave = useCallback(async () => {
    if (messages.length === 0) return;
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title: messages[0]?.content.substring(0, 40) || 'Manual Saved Chat',
          messages,
        }),
      });
      setSidebarRefreshKey(k => k + 1);
    } catch (e) {}
  }, [messages, sessionId]);

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

  // Sayfa yenilendiğinde verileri veritabanından tazelemek için (Re-hydration sync)
  useEffect(() => {
    // SessionId varsa ve uygulama mount olmuşsa verileri çek
    if (mounted && sessionId) {
      handleLoadChat(sessionId);
    }
  }, [mounted, sessionId, handleLoadChat]);

  if (!mounted) {
    return <div className="h-screen w-screen bg-[var(--color-bg-primary)] animate-pulse" />;
  }

  return (
    <div className="flex h-screen max-h-screen flex-col pt-16 overflow-hidden bg-[var(--color-bg-primary)]">
      {globalError && (
        <div className="absolute top-16 left-0 right-0 z-50 p-3 bg-[var(--color-accent-error)]/10 border-b border-[var(--color-accent-error)]/20 text-[var(--color-accent-error)] text-xs font-mono text-center flex items-center justify-center gap-2">
          {globalError}
          <button onClick={() => setGlobalError(null)} className="ml-2 hover:text-[var(--color-accent-error)]/80">
            X
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden min-h-0 flex-row">
        <Sidebar
          onNewChat={resetChat}
          onLoadChat={handleLoadChat}
          activeChatId={sessionId}
          refreshKey={sidebarRefreshKey}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          {/* spec bar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">Session</span>
              <span className="font-mono text-[11px] font-bold text-[var(--color-accent-primary)]">
                {sessionId ? `#${sessionId.slice(0, 6).toUpperCase()}` : '#NEW'}
              </span>
              <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" />
              <span className="hidden items-center gap-2 sm:flex">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]">Msg</span>
                <span className="font-mono text-[10px] font-bold tabular-nums text-[var(--color-text-secondary)]">
                  {String(messages.length).padStart(2, '0')}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Overview isCompact={true} />
              <span className="hidden items-center gap-1.5 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-secondary)]">
                  Protocol Active
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden min-h-0">
            <div className="flex w-full flex-col border-r border-[var(--color-border)] md:w-[55%] lg:w-[55%] flex-shrink-0">
              <ChatPanel
                messages={messages}
                onNewMessage={handleNewMessage}
                onCodeExtracted={setEditorCode}
                isStreaming={isStreaming}
                isAnalyzing={isAnalyzing}
                onFeedback={handleFeedback}
                showFeedback={messages.length > 0 && !isStreaming}
                usage={usage}
              />
            </div>

            <LimitModal 
              isOpen={isLimitModalOpen} 
              onClose={() => setIsLimitModalOpen(false)} 
            />

            <div className="hidden flex-1 flex-col md:flex md:w-[45%] lg:w-[45%] min-w-0">
              <EditorPanel
                code={editorCode}
                onCodeChange={setEditorCode}
                isStreaming={isStreaming}
                sessionId={sessionId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
