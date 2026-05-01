'use client';

import React from 'react';
import { Code, Copy, CheckCircle2, Loader2, Cloud, Share2 } from 'lucide-react';
import DownloadButton from '@/features/gallery/components/DownloadButton';

const GithubIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface EditorHeaderProps {
  code: string;
  t: (key: string) => string;
  copied: boolean;
  handleCopy: () => void;
  isSaving: boolean;
  handleCloudSave: () => void;
  setIsGitHubOpen: (val: boolean) => void;
  setIsGalleryOpen: (val: boolean) => void;
}

export function EditorHeader({
  code,
  t,
  copied,
  handleCopy,
  isSaving,
  handleCloudSave,
  setIsGitHubOpen,
  setIsGalleryOpen,
}: EditorHeaderProps) {
  const lineCount = code.trim() ? code.split('\n').length : 0;

  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
           <Code size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('chat.script_editor')}</h2>
          <p className="text-[10px] font-mono text-emerald-500/50 mt-0.5 uppercase tracking-widest italic">
            {lineCount > 0 ? `${lineCount} ${t('editor.lines')}` : t('chat.status_ready')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          disabled={!code.trim()}
          className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 rounded-xl transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-30 active:scale-95"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? t('general.copied') : t('general.copy')}
        </button>

        <button
          onClick={handleCloudSave}
          disabled={!code.trim() || isSaving}
          className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 rounded-xl transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 disabled:opacity-30 active:scale-95"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Cloud size={12} />}
          {isSaving ? t('editor.saving') : t('editor.save_to_cloud')}
        </button>
        
        <DownloadButton code={code} />
        
        <button
          onClick={() => setIsGitHubOpen(true)}
          disabled={!code.trim()}
          className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 rounded-xl transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-30 active:scale-95"
        >
          <GithubIcon />
          GitHub
        </button>

        <button
          onClick={() => setIsGalleryOpen(true)}
          disabled={!code.trim()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-95 disabled:opacity-30"
        >
          <Share2 size={14} />
          {t('gallery.post').toUpperCase()}
        </button>
      </div>
    </div>
  );
}
