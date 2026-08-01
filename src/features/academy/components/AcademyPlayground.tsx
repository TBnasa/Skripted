'use client';

import { Code2, Play, Book, GraduationCap } from 'lucide-react';

export function AcademyPlayground() {
  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-bg-secondary/50">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-text-primary px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)]">
            <Code2 size={14} className="text-[var(--color-text-secondary)]" />
            Playground.sk
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors">
            <Book size={14} />
            Documentation
          </button>
        </div>
        
        <button className="flex items-center gap-2 text-xs font-bold bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white px-4 py-1.5 rounded-lg transition-all active:scale-95 ink-shadow-sm">
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
              <span className="text-[var(--color-text-secondary)]">on</span> <span className="text-[var(--color-text-primary)]">join</span>:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[var(--color-text-secondary)]">set</span> <span className="text-text-primary">&#123;welcome message&#125;</span> <span className="text-[var(--color-text-secondary)]">to</span> <span className="text-[var(--color-text-primary)]">"Hoş geldin %player%!"</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[var(--color-text-secondary)]">send</span> <span className="text-text-primary">&#123;welcome message&#125;</span> <span className="text-[var(--color-text-secondary)]">to</span> <span className="text-[var(--color-text-primary)]">player</span>
            </div>
          </div>
        </div>

        <div className="h-1/3 border-t border-border p-6 bg-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-[var(--color-text-secondary)]" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Console Output</h4>
          </div>
          <div className="font-mono text-xs space-y-2">
            <p className="text-[var(--color-text-secondary)]/80">[System] Academy Environment initialized.</p>
            <p className="text-text-muted">[Hint] Try changing the variable name to complete the challenge.</p>
          </div>
        </div>
        
        {/* Visual Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <GraduationCap size={400} className="text-[var(--color-accent-primary)]/10" />
        </div>
      </div>
    </div>
  );
}
