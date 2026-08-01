'use client';

import { useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import type { ChatMessage } from '@/types';
import { motion } from 'framer-motion';
import AnalysisPanel from './AnalysisPanel';

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

  const parsePerformanceScore = (content: string): number | null => {
    try {
      const match = content.match(/\[FINAL_ANALYSIS\]:\s*(?:```json\n?)?(\{[\s\S]*?\})(?:\n?```)?/i);
      if (match) {
        const jsonStr = match[1].replace(/```json\n?|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        return typeof data.score === 'number' ? data.score : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const performanceScore = !isUser ? parsePerformanceScore(message.content) : null;

  const getScoreColor = (score: number) => {
    if (score <= 40) return 'bg-red-500';
    if (score <= 75) return 'bg-amber-500';
    return 'bg-[var(--color-accent-primary)]';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 40) return 'Critical';
    if (score <= 75) return 'Needs Work';
    return 'Optimized';
  };

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
              ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
              : 'bg-[var(--color-accent-glow)] text-[var(--color-text-primary)]'
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
            ? 'bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] rounded-xl rounded-tr-sm border border-[var(--color-border-active)]'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-xl rounded-tl-sm border border-[var(--color-border)] border-l-2 border-l-[var(--color-border-active)]'
        }`}
      >
        {/* msg header — mono role + timestamp */}
        <div className="mb-2 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.25em]">
          <span className={isUser ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'}>
            {isUser ? 'You' : 'Engine'}
          </span>
          <span className="h-px w-6 bg-[var(--color-border)]" />
          <span className="font-normal normal-case tracking-normal tabular-nums text-[var(--color-text-muted)]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Performance Score Gauge (for Assistant only) */}
        {performanceScore !== null && (
          <div className="mb-4 p-3 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Optimization Score
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getScoreColor(performanceScore)}/20 text-[var(--color-text-primary)]`}>
                {performanceScore}/100 • {getScoreLabel(performanceScore)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${performanceScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getScoreColor(performanceScore)}`}
              />
            </div>
          </div>
        )}

        {/* Categorized Analysis (for Assistant only) */}
        {!isUser && <AnalysisPanel content={message.content} />}

        {/* Reasoning/Thinking block */}
        {message.reasoning && (
          <details className="mb-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] group" open={!message.content}>
            <summary className="cursor-pointer select-none list-none flex items-center justify-between px-3 py-2 text-[10px] tracking-widest uppercase text-[var(--color-text-muted)] hover:bg-[var(--color-accent-glow)] transition-colors">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-glow)] opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" />
                </span>
                <span className="font-medium">{t('chat.thinking_process')}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-180 transition-transform duration-300">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="px-3 pb-3 pt-1 font-mono text-[11px] text-[var(--color-text-muted)] italic leading-relaxed whitespace-pre-wrap border-t border-[var(--color-border)]">
              {message.reasoning}
            </div>
          </details>
        )}

        {/* Content */}
        {(() => {
          // Nuclear strip: Any block or code that looks like our data structure
          const displayContent = message.content
            .replace(/(?:\[|\*\*)FINAL_ANALYSIS(?:\]|\*\*):?\s*(?:```json\n?)?\{[\s\S]*?\}(?:\n?```)?/gi, '')
            .replace(/(?:\[|\*\*)VISUAL_FLOW(?:\]|\*\*):?\s*(?:```json\n?)?\{[\s\S]*?\}(?:\n?```)?/gi, '')
            .replace(/```[\s\S]*?"node":[\s\S]*?```/gi, '') // Nuke any code block with "node" key
            .replace(/\{[\s\S]*?"visual_flow_data"[\s\S]*?\}/gi, '')
            .replace(/\{[\s\S]*?"branches"[\s\S]*?"node":[\s\S]*?\}/gi, '')
            .trim();

          if (!displayContent && message.reasoning) return null;
          
          const segments = displayContent.split(/(```[\s\S]*?```|```[\s\S]*$)/g);
          
          return segments.map((segment, i) => {
            if (segment.startsWith('```')) {
              const lang = segment.match(/^```(\w+)?/)?.[1]?.toLowerCase() || '';
              // Hide JSON blocks from the main chat bubble if they look like analysis
              if (lang === 'json') return null;
              
              const codeContent = segment.replace(/^```\w*\n?/g, '').replace(/```$/g, '');
              return (
                <pre
                  key={i}
                  className="my-3 overflow-x-auto rounded-xl bg-[var(--color-bg-tertiary)] p-4 font-mono text-[13px] leading-relaxed border border-[var(--color-border)] text-[var(--color-text-secondary)]/90"
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
