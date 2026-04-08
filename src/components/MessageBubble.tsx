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
        className={`flex h-10 w-10 shrink-0 items-center justify-center border-4 border-black font-bold shadow-[2px_2px_0_#000] ${
          isUser
            ? 'bg-[var(--color-accent-primary)] text-black'
            : 'bg-[var(--color-text-primary)] text-black'
        }`}
        style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        className={`max-w-[80%] border-4 border-black px-4 py-3 text-lg leading-relaxed shadow-[4px_4px_0_#000] ${
          isUser
            ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)]'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
        }`}
      >
        {/* Reasoning/Thinking block */}
        {message.reasoning && (
          <details className="mb-3 border-4 border-black bg-[#1a1a1a] p-2 text-sm text-[var(--color-text-muted)] shadow-[2px_2px_0_#000] group" open={!message.content}>
            <summary className="cursor-pointer font-bold select-none list-none flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="group-open:rotate-180 transition-transform">
                <path d="M6 9l6 6 6-6" />
              </svg>
              <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', textTransform: 'uppercase' }}>Thinking Process</span>
            </summary>
            <div className="mt-2 pl-2 border-l-4 border-[var(--color-border)] whitespace-pre-wrap italic">
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
