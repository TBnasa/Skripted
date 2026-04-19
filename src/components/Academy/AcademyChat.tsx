'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import { getLessonById } from '@/lib/academy-data';

interface Message {
  role: 'mentor' | 'user';
  content: string;
}

export function AcademyChat() {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const store = useAcademyStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const currentLesson = getLessonById(store.currentLessonId);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Greeting on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const greeting: Message = {
      role: 'mentor',
      content: isTr
        ? `Selam! 👋 Ben senin Skript mentörünüm. Seni kopyala-yapıştır döngüsünden çıkarıp bir sistem mimarına dönüştürmek için buradayım.\n\nŞu an **${currentLesson?.title_tr || 'ilk dersine'}** üzerinde çalışıyorsun. Takıldığın yer olursa sor, birlikte çözelim! 🎯`
        : `Hey! 👋 I'm your Skript mentor. I'm here to transform you from a copy-paste coder into a system architect.\n\nYou're currently working on **${currentLesson?.title_en || 'your first lesson'}**. If you get stuck, just ask and we'll solve it together! 🎯`,
    };

    const timer = setTimeout(() => setMessages([greeting]), 800);
    return () => clearTimeout(timer);
  }, [isTr, currentLesson]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const lesson = getLessonById(store.currentLessonId);
      const response = await fetch('/api/academy/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          lessonContext: {
            lessonId: store.currentLessonId,
            lessonTitle: isTr ? lesson?.title_tr : lesson?.title_en,
            lessonObjective: isTr ? lesson?.objective_tr : lesson?.objective_en,
            phase: lesson?.phase || 'blocks',
          },
          mistakes: store.mistakes.slice(-5),
          userLevel: store.getLevel(),
          lang,
          history: messages.slice(-6).map(m => ({
            role: m.role === 'mentor' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Mentor API failed');

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let mentorContent = '';

      // Add empty mentor message
      setMessages(prev => [...prev, { role: 'mentor', content: '' }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              mentorContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'mentor', content: mentorContent };
                return updated;
              });
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    } catch (err) {
      console.error('[Academy Mentor] Error:', err);
      setIsTyping(false);

      // Fallback response
      const fallback: Message = {
        role: 'mentor',
        content: isTr
          ? '🔧 Şu an mentor servisi meşgul. Ama merak etme, ipuçları her zaman yanında! Sol taraftaki 💡 butonunu kullan.'
          : '🔧 The mentor service is busy right now. But don\'t worry, hints are always available! Use the 💡 button on the left.',
      };
      setMessages(prev => [...prev, fallback]);
    }
  }, [input, isTyping, store, lang, isTr, messages]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)]/50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-md",
                msg.role === 'mentor'
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                  : "bg-white/10 text-white"
              )}>
                {msg.role === 'mentor' ? <Bot size={14} /> : <User size={14} />}
              </div>

              <div className={cn(
                "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                msg.role === 'mentor'
                  ? "bg-white/[0.04] text-zinc-300 border border-white/[0.06] rounded-tl-none"
                  : "bg-purple-600 text-white rounded-tr-none"
              )}>
                {/* Simple markdown-like rendering */}
                {msg.content.split('\n').map((line, j) => (
                  <React.Fragment key={j}>
                    {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                      k % 2 === 1 ? <strong key={k} className="text-white font-bold">{part}</strong> : part
                    )}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] rounded-tl-none flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span className="text-xs text-zinc-500">
                {isTr ? 'Mentor düşünüyor...' : 'Mentor is thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.04] bg-white/[0.01]">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isTr ? 'Mentöre sor...' : 'Ask the mentor...'}
            disabled={isTyping}
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-purple-500/40 
                       rounded-xl py-3 pl-4 pr-12 text-sm transition-all outline-none
                       disabled:opacity-50 placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 
                       hover:bg-purple-500 text-white rounded-lg flex items-center justify-center 
                       transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/20
                       disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send size={14} />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
          <Sparkles size={8} className="text-purple-400" />
          Powered by Skripted Adaptive Mentor
        </div>
      </div>
    </div>
  );
}
