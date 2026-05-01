'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import MessageBubble from './MessageBubble';
import FeedbackPoll from '@/features/shared/components/FeedbackPoll';
import { Button } from '@/features/shared/components/ui/Button';
import { Badge } from '@/features/shared/components/ui/Badge';
import { Terminal, Cpu, Zap, SendHorizonal, AlertCircle, Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '@/types';
import { useVoiceRecording } from '@/features/shared/hooks/useVoiceRecording';
import { toast } from 'sonner';

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

  const { isRecording, isProcessing, toggleRecording } = useVoiceRecording({
    onTranscript: (text) => {
      setInput(prev => prev ? `${prev} ${text}` : text);
      // Auto-resize textarea after voice input
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
      }, 50);
    },
    onError: (errKey) => {
      toast.error(t(`chat.${errKey}` as any));
    }
  });

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
        <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400">
          <Terminal size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] truncate">{t('chat.terminal_header')}</h2>
          <p className="hidden sm:block text-[10px] font-mono text-emerald-500/70 mt-0.5">
            {isStreaming ? (
              <span className="flex items-center gap-1.5">
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Cpu size={10} className="animate-spin" />
                    {t('chat.analyzing_code')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {t('chat.status_compiling')}
                  </span>
                )}
              </span>
            ) : t('status.system_status_ok')}
          </p>
        </div>

        {/* Usage & Version */}
        <div className="flex items-center gap-2">
          {usage && (
            <Badge variant="emerald" className="hidden sm:flex gap-1.5">
              <span className="text-zinc-400">Usage:</span>
              <span>{usage.current}</span>
              <span className="opacity-40">/</span>
              <span>{usage.limit}</span>
            </Badge>
          )}

        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="animate-fade-in-scale glass-card p-10 max-w-md mx-auto">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 animate-float">
                <Zap size={28} />
              </div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {t('chat.input_required')}
              </h3>
              <p className="mb-8 mx-auto max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
                {t('chat.input_desc')}
              </p>
              <div className="flex sm:flex-wrap justify-center gap-2">
                {[t('chat.suggestion_economy'), t('chat.suggestion_warp'), t('status.admin_tools')].map((s) => (
                  <Button key={s} variant="secondary" size="sm" onClick={() => setInput(s)}>
                    {s}
                  </Button>
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
          <div className="flex items-center gap-1.5 pb-1 pr-1">
            <Button
              size="icon"
              variant="secondary"
              type="button"
              onClick={toggleRecording}
              disabled={isStreaming || isProcessing}
              className={`relative transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-white/[0.02] text-zinc-400 hover:text-emerald-400'
              }`}
              aria-label={isRecording ? t('chat.voice_stop') : t('chat.voice_start')}
              title={isProcessing ? t('chat.voice_processing') : (isRecording ? t('chat.voice_stop') : t('chat.voice_start'))}
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin text-emerald-500" />
              ) : isRecording ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-500/20 rounded-full"
                  />
                  <Square size={18} fill="currentColor" />
                </div>
              ) : (
                <Mic size={20} />
              )}
            </Button>

            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming || isRecording || isProcessing}
              aria-label="Send Message"
            >
              <SendHorizonal size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
