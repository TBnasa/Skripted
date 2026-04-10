'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import MessageBubble from './MessageBubble';
import FeedbackPoll from './FeedbackPoll';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  readonly messages: ChatMessage[];
  readonly onNewMessage: (content: string) => void;
  readonly onCodeExtracted: (code: string) => void;
  readonly isStreaming: boolean;
  readonly streamingContent: string;
  readonly streamingReasoning?: string;
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly showFeedback: boolean;
}

export default function ChatPanel({
  messages,
  onNewMessage,
  isStreaming,
  streamingContent,
  streamingReasoning,
  onFeedback,
  showFeedback,
}: ChatPanelProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    onNewMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onNewMessage]);

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-bg-tertiary)] px-5 py-4 bg-[var(--color-bg-secondary)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)] text-[var(--color-accent-primary)] shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">{t('terminal_header')}</h2>
          <p className="text-[10px] font-mono text-[var(--color-accent-primary)] uppercase font-bold tracking-[0.15em] mt-1">
            {isStreaming ? t('status_compiling') : t('status_ready')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 engine-bg">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-90">
            <div className="mb-4 border border-[var(--color-bg-tertiary)] p-8 bg-[var(--color-bg-secondary)] shadow-xl rounded-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-primary)]">
                {t('input_required')}
              </h3>
              <p className="mb-8 max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)] uppercase tracking-wide">
                {t('input_desc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'Economy System',
                  'Custom /warp',
                  'Admin Tools',
                  'Item Editor',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="mc-btn bg-[var(--color-bg-tertiary)] px-4 py-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-accent-primary)] transition-all"
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
        {isStreaming && !streamingContent && (
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-accent-secondary)] shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--color-accent-secondary)]">{t('ai_asistan')}</span>
            </div>
            <div className="bg-[var(--color-bg-secondary)] px-5 py-4 border border-[var(--color-bg-tertiary)] shadow-lg rounded-2xl rounded-tl-none mt-1">
              <div className="typing-indicator flex gap-1">
                <span className="h-1.5 w-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback poll */}
        <FeedbackPoll onFeedback={onFeedback} visible={showFeedback} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] p-5">
        <div className="flex items-end gap-3 rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)] px-4 py-3 shadow-inner focus-within:border-[var(--color-accent-primary)] transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            rows={1}
            className="flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none py-1"
            disabled={isStreaming}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="mc-btn flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--color-accent-primary)] text-black transition-all hover:bg-[var(--color-accent-success)] disabled:opacity-50 disabled:grayscale"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-center font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] text-[9px]">
          {t('kernel_info')}
        </p>
      </div>
    </div>
  );
}
