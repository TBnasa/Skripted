'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ChatPanel from '@/components/ChatPanel';
import EditorPanel from '@/components/EditorPanel';
import Sidebar from '@/components/Sidebar';
import LimitModal from '@/components/LimitModal';
import Overview from '@/components/Dashboard/Overview';
import { useTranslation } from '@/lib/useTranslation';
import useSWR from 'swr';
import type { ChatMessage, FeedbackPayload } from '@/types';

export default function ChatInterface() {
  const translation = useTranslation();
  const t = translation?.t || ((key: string) => key);
  const lang = translation?.lang || 'en';
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
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [skriptVersion, setSkriptVersion] = useState('2.7 (Latest)');
  
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: usage, mutate: mutateUsage } = useSWR('/api/session/usage', fetcher);
  const pineconeIdsRef = useRef<string[]>([]);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
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

        // Strict Language Mirroring: LOCK the session language to the literal input language.
        const trChars = /[ışğüöçİŞĞÜÖÇ]/;
        const commonTrWords = /\b(merhaba|selam|nasılsın|yap|et|olsun|nasıl|nedir|ekle|sil|ayarla|mesaj)\b/i;
        
        // NO GUESSING: If input contains TR markers, it's TR. Otherwise, it's EN.
        // We override the global 'lang' setting with the explicit input language.
        const activeLang = (trChars.test(content) || commonTrWords.test(content)) ? 'tr' : 'en';

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: content,
            history: currentHistory.slice(0, -1),
            addons,
            currentCode: editorCode,
            lang: activeLang,
            skriptVersion: skriptVersion
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (errorData.code === 'LIMIT_REACHED') {
            setIsLimitModalOpen(true);
            throw new Error(errorData.error);
          }
          
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
          
          // Update Dashboard Stats
          const score = parsePerformanceScore(finalAssistantContent);
          if (score !== null) {
            updateDashboardStats(score, finalAssistantContent);
          }
          
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
        mutateUsage(); // Refresh usage after generation
      }
    },
    [generateId, extractCode, editorCode, lang],
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
          body: JSON.stringify({ ...payload, lang }),
        });
      } catch (error) {}

      setShowFeedback(false);
    },
    [editorCode, lang],
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

  const parsePerformanceScore = (content: string): number | null => {
    try {
      const match = content.match(/\[FINAL_ANALYSIS\]:\s*(\{[\s\S]*?\})(?=\n\n|$)/i);
      if (match) {
        const jsonStr = match[1].replace(/```json\n?|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        return typeof data.score === 'number' ? data.score : null;
      }
      // Fallback to simpler regex if JSON not found yet (streaming)
      const fallbackMatch = content.match(/"score":\s*(\d+)/);
      return fallbackMatch ? parseInt(fallbackMatch[1]) : null;
    } catch {
      return null;
    }
  };

  const updateDashboardStats = (newScore: number, content: string) => {
    // 1. Update Legacy Stats (for immediate UI)
    const saved = localStorage.getItem('skripted_dashboard_stats');
    let stats = saved ? JSON.parse(saved) : { totalAnalyzed: 0, averageScore: 0, commonError: 'None', totalScore: 0 };
    
    stats.totalAnalyzed += 1;
    stats.totalScore = (stats.totalScore || 0) + newScore;
    stats.averageScore = Math.round(stats.totalScore / stats.totalAnalyzed);
    
    let currentCategory = 'None';
    try {
      const match = content.match(/\[FINAL_ANALYSIS\]:\s*(\{[\s\S]*?\})/i);
      if (match) {
        const data = JSON.parse(match[1].replace(/```json\n?|```/g, '').trim());
        if (data.syntax?.length > 0) currentCategory = 'Syntax';
        else if (data.logic?.length > 0) currentCategory = 'Logic';
        else if (data.performance?.length > 0) currentCategory = 'Optimization';
      }
    } catch {
      // Fallback to emoji check
      if (content.includes('🔴')) currentCategory = 'Syntax';
      else if (content.includes('🟡')) currentCategory = 'Logic';
      else if (content.includes('🔵')) currentCategory = 'Optimization';
    }
    
    stats.commonError = currentCategory;
    localStorage.setItem('skripted_dashboard_stats', JSON.stringify(stats));

    // 2. Update Detailed History
    const historySaved = localStorage.getItem('skripted_history');
    let history = historySaved ? JSON.parse(historySaved) : [];
    
    const newAnalysis = {
      id: crypto.randomUUID(),
      title: lastPromptRef.current.substring(0, 40) + (lastPromptRef.current.length > 40 ? '...' : ''),
      score: newScore,
      category: currentCategory,
      timestamp: Date.now()
    };

    history.unshift(newAnalysis); // Add to beginning
    if (history.length > 50) history.pop(); // Keep last 50
    
    localStorage.setItem('skripted_history', JSON.stringify(history));
    
    // Trigger updates
    window.dispatchEvent(new Event('dashboard_update'));
  };

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

        <div className="flex flex-1 flex-col overflow-hidden min-h-0">
          {/* Dashboard Mini-Summary */}
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
              onCodeExtracted={handleCodeExtracted}
              isStreaming={isStreaming}
              isAnalyzing={isAnalyzing}
              streamingContent={streamingContent}
              streamingReasoning={streamingReasoning}
              onFeedback={handleFeedback}
              showFeedback={showFeedback}
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
