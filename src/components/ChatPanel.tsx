'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import MessageBubble from './MessageBubble';
import FeedbackPoll from './FeedbackPoll';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  readonly messages: ChatMessage[];
  readonly onNewMessage: (content: string, addons: string[]) => void;
  readonly onCodeExtracted: (code: string) => void;
  readonly isStreaming: boolean;
  readonly isAnalyzing?: boolean;
  readonly streamingContent: string;
  readonly streamingReasoning?: string;
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly showFeedback: boolean;
  readonly usage?: { current: number; limit: number };
}

export default function ChatPanel({
  messages,
  onNewMessage,
  isStreaming,
  isAnalyzing,
  streamingContent,
  streamingReasoning,
  onFeedback,
  showFeedback,
  usage,
}: ChatPanelProps) {
  const { t, mounted } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    onNewMessage(trimmed, selectedAddons);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onNewMessage, selectedAddons]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleTextareaInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    },
    [],
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, streamingReasoning]);

  if (!mounted) return <div className="flex h-full flex-col min-h-0 glass-panel m-2 rounded-2xl bg-[#0a0a0a]" />;

  return (
    <div className="flex h-full flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-white/[0.04] px-3 sm:px-5 py-3 sm:py-4 bg-white/[0.01]">
        <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400">
          <svg width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] truncate">{t('chat.terminal_header')}</h2>
          <p className="hidden sm:block text-[10px] font-mono text-emerald-500/70 mt-0.5">
            {isStreaming ? (
              <span className="flex items-center gap-1.5">
                {isAnalyzing ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-emerald-400 border-t-transparent" />
                    </span>
                    <span className="text-emerald-400">{t('chat.analyzing_code')}</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    {t('chat.status_compiling')}
                  </>
                )}
              </span>
            ) : t('status.system_status_ok')}
          </p>
        </div>

        {/* Usage Indicator */}
        {usage && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg sm:rounded-xl shrink-0">
            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
              <span className="hidden sm:inline">Usage: </span><span className="text-emerald-400">{usage.current}</span><span className="opacity-40">/</span>{usage.limit}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="animate-fade-in-scale glass-card p-10 max-w-md mx-auto">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 animate-float">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              </div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {t('chat.input_required')}
              </h3>
              <p className="mb-8 mx-auto max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t('chat.input_desc')}
              </p>
              <div className="flex sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-hide px-1">
                {[
                  t('chat.suggestion_economy'),
                  t('chat.suggestion_warp'),
                  t('status.admin_tools'),
                  t('chat.suggestion_item'),
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="animate-fade-in whitespace-nowrap px-4 py-2 text-[11px] font-medium text-[var(--color-text-secondary)] bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-emerald-500/20 hover:text-emerald-400 transition-all duration-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isStreaming && (streamingContent || streamingReasoning) && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              reasoning: streamingReasoning,
              timestamp: Date.now(),
            }}
          />
        )}

        {/* Typing indicator */}
        {isStreaming && !isAnalyzing && !streamingContent && (
          <div className="animate-fade-in flex gap-3 items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
                </svg>
              </div>
            </div>
            <div className="bg-white/[0.02] px-5 py-3.5 border border-white/[0.04] rounded-2xl rounded-tl-sm mt-1">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s] opacity-60"></span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s] opacity-60"></span>
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce opacity-60"></span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback poll */}
        <FeedbackPoll onFeedback={onFeedback} visible={showFeedback} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 z-20 mt-auto p-3 sm:p-4 bg-[#0a0a0a] border-t border-white/[0.04] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {/* Addon Selector */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide px-0.5">
          {['SkBee', 'SkQuery', 'SkRayFall'].map(addon => (
            <button
              key={addon}
              onClick={() => setSelectedAddons(prev => prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon])}
              className={`whitespace-nowrap px-2.5 py-1 text-[10px] rounded-lg border transition-all ${
                selectedAddons.includes(addon)
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {addon}
            </button>
          ))}
        </div>

        <div className="relative group/input flex items-end gap-2 bg-black/50 backdrop-blur-xl overflow-hidden rounded-2xl border border-white/[0.08] focus-within:border-emerald-500/30 transition-all duration-300 p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            className="flex-1 resize-none bg-transparent font-mono text-[13px] sm:text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none py-2.5 px-3 min-h-[44px]"
            disabled={isStreaming}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-20 disabled:grayscale"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="hidden sm:block mt-3 text-center text-[9px] font-medium tracking-[0.15em] text-[var(--color-text-muted)]/50 uppercase">
          {t('chat.kernel_info')}
        </p>
      </div>
    </div>
  );
}
