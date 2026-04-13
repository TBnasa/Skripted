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
      {/* Avatar */}
      <div className={`flex flex-col items-center gap-1 shrink-0 ${isUser ? 'order-last' : ''}`}>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
            isUser
              ? 'bg-white/[0.05] text-[var(--color-text-secondary)]'
              : 'bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {isUser ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
            </svg>
          )}
        </div>
      </div>

      <div
        className={`max-w-[80%] px-4 py-3.5 text-sm leading-relaxed transition-all ${
          isUser
            ? 'bg-white/[0.04] text-[var(--color-text-primary)] rounded-2xl rounded-tr-sm border border-white/[0.04]'
            : 'bg-white/[0.02] text-[var(--color-text-primary)] rounded-2xl rounded-tl-sm border border-white/[0.04] border-l-2 border-l-emerald-500/30'
        }`}
      >
        {/* Reasoning/Thinking block */}
        {message.reasoning && (
          <details className="mb-3 overflow-hidden rounded-xl border border-white/[0.04] bg-black/20 group" open={!message.content}>
            <summary className="cursor-pointer select-none list-none flex items-center justify-between px-3 py-2 text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium">{t('chat.thinking_process')}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform duration-300">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="px-3 pb-3 pt-1 font-mono text-[11px] text-[var(--color-text-muted)] italic leading-relaxed whitespace-pre-wrap border-t border-white/[0.03]">
              {message.reasoning}
            </div>
          </details>
        )}

        {/* Content */}
        {(() => {
          const content = message.content;
          if (!content && message.reasoning) return null;
          
          const segments = content.split(/(```[\s\S]*?```|```[\s\S]*$)/g);
          
          return segments.map((segment, i) => {
            if (segment.startsWith('```')) {
              const codeContent = segment.replace(/^```\w*\n?/g, '').replace(/```$/g, '');
              return (
                <pre
                  key={i}
                  className="my-3 overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-[13px] leading-relaxed border border-white/[0.04] text-emerald-300/90"
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
