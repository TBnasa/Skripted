'use client';

import { Undo2, Redo2, ClipboardPaste, Sparkles, ArrowRightToLine } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/Button';

interface EditorToolbarProps {
  triggerAction: (actionId: string) => void;
  handleTab: () => void;
}

export function EditorToolbar({ triggerAction, handleTab }: EditorToolbarProps) {
  const iconBtn = "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10";
  return (
    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-[var(--color-bg-elevated)]/90 backdrop-blur-xl border border-[var(--color-border-hover)] rounded-2xl shadow-2xl z-10">
      <Button onClick={() => triggerAction('undo')} variant="ghost" size="icon" className={iconBtn} aria-label="Undo">
        <Undo2 size={16} />
      </Button>
      <Button onClick={() => triggerAction('redo')} variant="ghost" size="icon" className={iconBtn} aria-label="Redo">
        <Redo2 size={16} />
      </Button>
      <div className="w-px h-6 bg-white/[0.06] mx-1" />
      <Button onClick={() => triggerAction('editor.action.clipboardPasteAction')} variant="ghost" size="icon" className={iconBtn} aria-label="Paste">
        <ClipboardPaste size={16} />
      </Button>
      <Button onClick={() => triggerAction('editor.action.formatDocument')} variant="ghost" size="icon" className="p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-accent-glow)]" aria-label="Format">
        <Sparkles size={16} />
      </Button>
      <Button onClick={handleTab} variant="ghost" size="icon" className={iconBtn} aria-label="Tab">
        <ArrowRightToLine size={16} />
      </Button>
    </div>
  );
}
