'use client';

import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Message {
  role: 'mentor' | 'user';
  content: string;
}

export function AcademyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Adaptive Interview Trigger
    const timer = setTimeout(() => {
      setMessages([{
        role: 'mentor',
        content: "Selam! Ben senin Skript mentörünüm. Seni kopyala-yapıştır döngüsünden çıkarıp bir sistem mimarına dönüştürmek için buradayım. Başlamadan önce; daha önce herhangi bir dilde kod yazdın mı, yoksa bugün sıfırdan bir efsane mi doğuyor?"
      }]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock response for now
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'mentor',
        content: "Harika! Bu yolculukta her adımda yanındayım. Şimdi ilk adım olarak temel yapıları inceleyelim."
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary/50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                msg.role === 'mentor' 
                  ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white" 
                  : "bg-white/10 text-text-primary"
              )}>
                {msg.role === 'mentor' ? <Bot size={18} /> : <User size={18} />}
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'mentor' 
                  ? "bg-bg-elevated text-text-primary border border-white/5 rounded-tl-none" 
                  : "bg-purple-600 text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="p-4 rounded-2xl bg-bg-elevated border border-white/5 rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-bg-secondary/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mentöre cevap ver..."
            className="w-full bg-bg-primary border border-white/10 focus:border-purple-500/50 rounded-2xl py-4 pl-6 pr-14 text-sm transition-all outline-none shadow-inner"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-text-muted uppercase tracking-widest font-bold">
          <Sparkles size={10} className="text-purple-400" />
          Powered by Skripted Adaptive Mentor
        </div>
      </div>
    </div>
  );
}
