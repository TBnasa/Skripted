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
        {/* Render content with improved streaming-safe logic */}
        {(() => {
          const content = message.content;
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
