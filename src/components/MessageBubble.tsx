'use client';

import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [message.content]);

  const isUser = message.role === 'user';

  return (
    <div
      ref={bubbleRef}
      className={`animate-fade-in flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
          isUser
            ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]'
            : 'bg-[var(--color-accent-success)]/20 text-[var(--color-accent-success)]'
        }`}
      >
        {isUser ? 'U' : '⚡'}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--color-accent-primary)]/15 text-[var(--color-text-primary)]'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
        }`}
      >
        {/* Reasoning/Thinking block */}
        {message.reasoning && (
          <details className="mb-3 rounded-lg bg-[var(--color-bg-primary)]/50 p-2 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]/50 group" open={!message.content}>
            <summary className="cursor-pointer font-bold select-none list-none flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6" />
              </svg>
              Thinking Process
            </summary>
            <div className="mt-2 pl-2 border-l-2 border-[var(--color-border)] whitespace-pre-wrap italic">
              {message.reasoning}
            </div>
          </details>
        )}

        {/* Render content with improved streaming-safe logic */}
        {(() => {
          const content = message.content;
          if (!content && message.reasoning) return null; // Show nothing if content is empty but thinking exists
          
          // Simple but robust split that handles unterminated blocks by treating them as plain code until finished
          const segments = content.split(/(```[\s\S]*?```|```[\s\S]*$)/g);
          
          return segments.map((segment, i) => {
            if (segment.startsWith('```')) {
              // Remove markers and any language hints
              const codeContent = segment.replace(/^```\w*\n?/g, '').replace(/```$/g, '');
              return (
                <pre
                  key={i}
                  className="my-2 overflow-x-auto rounded-lg bg-[var(--color-bg-primary)] p-3 font-[var(--font-mono)] text-xs leading-relaxed border border-[var(--color-border)]"
                >
                  <code className="block whitespace-pre">{codeContent || ' '}</code>
                </pre>
              );
            }
            if (!segment) return null;
            return <span key={i} className="whitespace-pre-wrap">{segment}</span>;
          });
        })()}
      </div>
    </div>
  );
}
