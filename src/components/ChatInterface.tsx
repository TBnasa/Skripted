'use client';

import { useCallback, useEffect, useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import EditorPanel from '@/components/EditorPanel';
import Sidebar from '@/components/Sidebar';
import LimitModal from '@/components/LimitModal';
import Overview from '@/components/Dashboard/Overview';
import { useTranslation } from '@/lib/useTranslation';
import { useStore } from '@/store/useStore';
import { useSkriptAnalysis } from '@/lib/hooks/use-skript-analysis';
import useSWR from 'swr';

export default function ChatInterface() {
  const { t } = useTranslation();
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
    skriptVersion,
    setSkriptVersion,
    resetChat
  } = useStore();

  const { handleNewMessage } = useSkriptAnalysis();
  
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: usage, mutate: mutateUsage } = useSWR('/api/session/usage', fetcher);

  const handleLoadChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) return;

      const chat = await res.json();
      setSessionId(chat.id);
      setMessages(Array.isArray(chat.content) ? chat.content : []);
      
      const lastAssistant = [...chat.content].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        // We'll trust the store for the editorCode if needed, or extract it here
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
          onNewChat={resetChat}
          onLoadChat={handleLoadChat}
          activeChatId={sessionId}
          refreshKey={sidebarRefreshKey}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          <div className="px-6 py-2 bg-[#0a0a0a] border-b border-white/[0.04] flex items-center justify-between">
            <Overview isCompact={true} />
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:block">
              Engine Protocol: <span className="text-emerald-500">Active</span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden min-h-0">
            <div className="flex w-full flex-col border-r border-white/[0.04] md:w-[55%] lg:w-[55%] flex-shrink-0">
              <ChatPanel
                messages={messages}
                onNewMessage={handleNewMessage}
                onCodeExtracted={setEditorCode}
                isStreaming={isStreaming}
                isAnalyzing={isAnalyzing}
                streamingContent="" // Handled by message state now or we can refine
                onFeedback={handleFeedback}
                showFeedback={messages.length > 0 && !isStreaming}
                usage={usage}
                skriptVersion={skriptVersion}
                onVersionChange={setSkriptVersion}
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
