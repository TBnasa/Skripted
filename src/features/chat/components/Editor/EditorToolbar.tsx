'use client';

import React from 'react';
import { Undo2, Redo2, ClipboardPaste, Sparkles, ArrowRightToLine } from 'lucide-react';

interface EditorToolbarProps {
  triggerAction: (actionId: string) => void;
  handleTab: () => void;
}

export function EditorToolbar({ triggerAction, handleTab }: EditorToolbarProps) {
  return (
    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-[#141414]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl z-10">
      <button 
        onClick={() => triggerAction('undo')} 
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"
        aria-label="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button 
        onClick={() => triggerAction('redo')} 
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"
        aria-label="Redo"
      >
        <Redo2 size={16} />
      </button>
      <div className="w-px h-6 bg-white/[0.06] mx-1"></div>
      <button 
        onClick={() => triggerAction('editor.action.clipboardPasteAction')} 
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"
        aria-label="Paste"
      >
        <ClipboardPaste size={16} />
      </button>
      <button 
        onClick={() => triggerAction('editor.action.formatDocument')} 
        className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl active:scale-90 transition-all font-bold text-[10px] uppercase tracking-widest"
        aria-label="Format"
      >
        <Sparkles size={16} />
      </button>
      <button 
        onClick={handleTab} 
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"
        aria-label="Tab"
      >
        <ArrowRightToLine size={16} />
      </button>
    </div>
  );
}
