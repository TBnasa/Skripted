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
      <div className="flex items-center gap-3 border-b-4 border-[var(--color-border)] px-5 py-4 bg-[var(--color-bg-secondary)]">
        <div className="flex h-10 w-10 items-center justify-center border-4 border-black bg-[var(--color-accent-primary)] shadow-[2px_2px_0_#000]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]" style={{ fontFamily: '"Press Start 2P", cursive' }}>Terminal / Chat</h2>
          <p className="text-xs font-mono text-[var(--color-accent-primary)] uppercase font-bold tracking-widest mt-1">
            {isStreaming ? 'Status: Compiling Response...' : 'Status: Ready'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 engine-bg">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-90">
            <div className="mb-4 border-4 border-[var(--color-border)] p-6 bg-[var(--color-bg-secondary)] shadow-[4px_4px_0_#000]">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--color-accent-primary)]" style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Input Required
              </h3>
              <p className="mb-6 max-w-sm text-lg leading-relaxed font-mono text-[var(--color-text-primary)] uppercase">
                Initialize script generation by describing your requirements.
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
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-4 border-black text-sm shadow-[2px_2px_0_#000] bg-[var(--color-text-primary)] text-black" style={{ fontFamily: '"Press Start 2P", cursive' }}>
              AI
            </div>
            <div className="bg-[var(--color-bg-secondary)] px-4 py-3 border-4 border-[var(--color-border)] shadow-[4px_4px_0_#000]">
              <div className="typing-indicator font-mono text-xl text-[var(--color-accent-primary)] animate-pulse font-bold tracking-widest">
                _
              </div>
            </div>
          </div>
        )}

        {/* Feedback poll */}
        <FeedbackPoll onFeedback={onFeedback} visible={showFeedback} />

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t-4 border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
        <div className="flex items-end gap-3 border-4 border-[var(--color-border)] bg-[#111111] px-4 py-3 shadow-[inset_4px_4px_0_rgba(0,0,0,0.5)] focus-within:border-[var(--color-accent-primary)] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe logic to generate..."
            rows={1}
            className="flex-1 resize-none bg-transparent font-mono text-xl leading-relaxed text-[var(--color-accent-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
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
        <p className="mt-3 text-center font-bold uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '1.5' }}>
          Kernel: Paper 1.21.1 · Build: Skript 2.14.3
        </p>
      </div>
    </div>
  );
}
