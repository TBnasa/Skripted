'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import FeedbackPoll from './FeedbackPoll';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  readonly messages: ChatMessage[];
  readonly onNewMessage: (content: string) => void;
  readonly onCodeExtracted: (code: string) => void;
  readonly isStreaming: boolean;
  readonly streamingContent: string;
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly showFeedback: boolean;
}

export default function ChatPanel({
  messages,
  onNewMessage,
  isStreaming,
  streamingContent,
  onFeedback,
  showFeedback,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    onNewMessage(trimmed);
    setInput('');

    // Reset textarea height
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
      // Auto-resize
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    },
    [],
  );

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Skripted Chat</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {isStreaming ? 'Generating...' : 'Describe the script you need'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-primary)]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
              What should I build?
            </h3>
            <p className="mb-6 max-w-xs text-sm text-[var(--color-text-muted)]">
              Describe the Minecraft Skript you need — from simple commands to complex game mechanics.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Welcome message on join',
                'Custom /home command',
                'KitPVP loadout system',
                'Anti-spam chat filter',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
          />
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-success)]/20 text-xs">
              ⚡
            </div>
            <div className="rounded-2xl bg-[var(--color-bg-tertiary)] px-4 py-3">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* Feedback poll */}
        <FeedbackPoll onFeedback={onFeedback} visible={showFeedback} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 transition-colors duration-200 focus-within:border-[var(--color-accent-primary)]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe the Skript you need..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            disabled={isStreaming}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
          Press Enter to send · Shift+Enter for new line · Targeting Paper 1.21.1
        </p>
      </div>
    </div>
  );
}
