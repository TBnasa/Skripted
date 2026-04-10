'use client';

import { useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import type { ChatMessage } from '@/types';

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useTranslation();
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
      {/* Avatar & Label */}
      <div className={`flex flex-col items-center gap-1.5 shrink-0 ${isUser ? 'order-last' : ''}`}>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-bg-tertiary)] shadow-sm transition-transform duration-300 hover:scale-105 ${
            isUser
              ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)]'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-accent-secondary)]'
          }`}
        >
          {isUser ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4M8 16v.01M16 16v.01" />
            </svg>
          )}
        </div>
        <span className={`text-[9px] uppercase font-bold tracking-widest ${isUser ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-accent-secondary)]'}`}>
          {isUser ? t('user_profile') : t('ai_asistan')}
        </span>
      </div>

      <div
        className={`max-w-[80%] border border-[var(--color-bg-tertiary)] px-5 py-4 text-sm leading-relaxed shadow-lg transition-all ${
          isUser
            ? 'bg-[var(--color-bg-tertiary)]/50 text-[var(--color-text-primary)] rounded-2xl rounded-tr-none'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-2xl rounded-tl-none border-l-4 border-l-[var(--color-accent-primary)] mt-1'
        }`}
      >
        {/* Reasoning/Thinking block */}
        {message.reasoning && (
          <details className="mb-4 overflow-hidden rounded-xl border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)]/50 transition-all group" open={!message.content}>
            <summary className="cursor-pointer font-bold select-none list-none flex items-center justify-between px-4 py-2.5 text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
                <span>{t('thinking_process')}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-1 font-mono text-[11px] text-[var(--color-text-muted)] italic leading-relaxed whitespace-pre-wrap border-t border-[var(--color-bg-tertiary)]/30">
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
                  className="my-3 overflow-x-auto bg-black p-3 font-mono text-base leading-relaxed border-4 border-[var(--color-border)] shadow-[inset_2px_2px_0_rgba(255,255,255,0.1)] text-[#a8ff60]"
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
