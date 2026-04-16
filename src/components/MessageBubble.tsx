'use client';

import { useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import type { ChatMessage } from '@/types';
import { motion } from 'framer-motion';
import AnalysisPanel from './Chat/AnalysisPanel';

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
    return 'bg-emerald-500';
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
        {/* Performance Score Gauge (for Assistant only) */}
        {performanceScore !== null && (
          <div className="mb-4 p-3 bg-black/30 rounded-xl border border-white/[0.04] overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Optimization Score
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getScoreColor(performanceScore)}/20 text-white/90`}>
                {performanceScore}/100 • {getScoreLabel(performanceScore)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${performanceScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getScoreColor(performanceScore)} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
              />
            </div>
          </div>
        )}

        {/* Categorized Analysis (for Assistant only) */}
        {!isUser && <AnalysisPanel content={message.content} />}

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
          // Strip analysis blocks from display content to avoid duplication (as they are shown in AnalysisPanel)
          const displayContent = message.content
            .replace(/\[FINAL_ANALYSIS\]:\s*(?:```json\n?)?\{[\s\S]*?\}(?:\n?```)?/gi, '')
            .replace(/-? ?🔴 \*\*Syntax Errors\*\*:[\s\S]*?(?=\n-? ?[🟡🔵]|$)/gi, '')
            .replace(/-? ?🟡 \*\*Logic & Modernization\*\*:[\s\S]*?(?=\n-? ?[🔴🔵]|$)/gi, '')
            .replace(/-? ?🔵 \*\*Optimization \(Performance\)\*\*:[\s\S]*?(?=\n-? ?[🔴🟡]|$)/gi, '')
            .replace(/\[Performance Score\]: \d+\/100/gi, '')
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
