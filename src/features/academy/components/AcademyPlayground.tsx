'use client';

import React from 'react';
import { Code2, Play, Book, GraduationCap } from 'lucide-react';

export function AcademyPlayground() {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-bg-secondary/50">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-text-primary px-3 py-1.5 rounded-lg bg-white/5">
            <Code2 size={14} className="text-purple-400" />
            Playground.sk
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
            <Book size={14} />
            Documentation
          </button>
        </div>
        
        <button className="flex items-center gap-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
          <Play size={14} fill="currentColor" />
          Kodu Çalıştır
        </button>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 p-6 font-mono text-sm text-text-secondary overflow-hidden">
          <div className="flex gap-4 h-full">
            <div className="text-text-muted select-none text-right w-8">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 outline-none whitespace-pre-wrap">
              <span className="text-purple-400">on</span> <span className="text-emerald-400">join</span>:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">set</span> <span className="text-text-primary">&#123;welcome message&#125;</span> <span className="text-purple-400">to</span> <span className="text-emerald-400">"Hoş geldin %player%!"</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">send</span> <span className="text-text-primary">&#123;welcome message&#125;</span> <span className="text-purple-400">to</span> <span className="text-emerald-400">player</span>
            </div>
          </div>
        </div>

        <div className="h-1/3 border-t border-border p-6 bg-black/40">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Console Output</h4>
          </div>
          <div className="font-mono text-xs space-y-2">
            <p className="text-emerald-500/80">[System] Academy Environment initialized.</p>
            <p className="text-text-muted">[Hint] Try changing the variable name to complete the challenge.</p>
          </div>
        </div>
        
        {/* Visual Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <GraduationCap size={400} className="text-purple-500" />
        </div>
      </div>
    </div>
  );
}
