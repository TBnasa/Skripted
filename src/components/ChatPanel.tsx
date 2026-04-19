'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import MessageBubble from './MessageBubble';
import FeedbackPoll from './FeedbackPoll';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Terminal, Cpu, Zap, SendHorizonal, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  readonly messages: ChatMessage[];
  readonly onNewMessage: (content: string, addons: string[]) => void;
  readonly onCodeExtracted: (code: string) => void;
  readonly isStreaming: boolean;
  readonly isAnalyzing?: boolean;
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly showFeedback: boolean;
  readonly usage?: { current: number; limit: number } | null;
}

export default function ChatPanel({
  messages,
  onNewMessage,
  isStreaming,
  isAnalyzing,
  onFeedback,
  showFeedback,
  usage,
}: ChatPanelProps) {
  const { t, mounted } = useTranslation();
  const [input, setInput] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    onNewMessage(trimmed, selectedAddons);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onNewMessage, selectedAddons]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!mounted) return <div className="flex h-full flex-col min-h-0 glass-panel m-2 rounded-2xl bg-[#0a0a0a]" />;

  return (
    <div className="flex h-full flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl relative">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-white/[0.04] px-3 sm:px-5 py-3 sm:py-4 bg-white/[0.01]">
        <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.05] text-zinc-400">
          <Terminal size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase">{t('chat.terminal_header')}</h2>
          <p className="hidden sm:block text-[10px] font-mono text-zinc-500 mt-0.5">
            {isStreaming ? (
              <span className="flex items-center gap-1.5">
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Cpu size={10} className="animate-spin" />
                    {t('chat.analyzing_code')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
                    {t('chat.status_compiling')}
                  </span>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 ">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {t('status.system_status_ok')}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="animate-fade-in p-10 max-w-md mx-auto">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.05] text-zinc-400">
                <Zap size={22} />
              </div>
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {t('chat.input_required')}
              </h3>
              <p className="mb-8 mx-auto max-w-sm text-sm leading-relaxed text-zinc-600 font-medium">
                {t('chat.input_desc')}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[t('chat.suggestion_economy'), t('chat.suggestion_warp'), t('status.admin_tools')].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="px-4 py-2 text-[11px] font-bold text-zinc-500 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-emerald-500/30 hover:text-emerald-500 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <FeedbackPoll onFeedback={onFeedback} visible={showFeedback} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-20 mt-auto p-3 sm:p-4 bg-[#0a0a0a] border-t border-white/[0.04]">
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {['SkBee', 'SkQuery', 'SkRayFall'].map(addon => (
            <button
              key={addon}
              onClick={() => setSelectedAddons(prev => prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon])}
              className={`whitespace-nowrap px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                selectedAddons.includes(addon)
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
              }`}
            >
              {addon}
            </button>
          ))}
        </div>

        <div className="relative flex items-end gap-2 bg-black/50 rounded-2xl border border-white/[0.08] focus-within:border-emerald-500/30 transition-all p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            className="flex-1 resize-none bg-transparent font-mono text-[13px] sm:text-sm text-white focus:outline-none py-2.5 px-3 min-h-[44px]"
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            aria-label="Send Message"
          >
            <SendHorizonal size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
