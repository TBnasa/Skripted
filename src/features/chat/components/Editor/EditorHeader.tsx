'use client';

import { Code, Copy, CheckCircle2, Loader2, Cloud, Share2, Layout } from 'lucide-react';
import DownloadButton from '@/features/gallery/components/DownloadButton';
import { Button } from '@/features/shared/components/ui/Button';

const GithubIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface EditorHeaderProps {
  code: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  copied: boolean;
  handleCopy: () => void;
  isSaving: boolean;
  handleCloudSave: () => void;
  setIsGitHubOpen: (val: boolean) => void;
  setIsGalleryOpen: (val: boolean) => void;
  onGUIBuilderToggle?: () => void;
  isGUIBuilderOpen?: boolean;
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
  onGUIBuilderToggle,
  isGUIBuilderOpen,
}: EditorHeaderProps) {
  const lineCount = code.trim() ? code.split('\n').length : 0;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-active)] bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]">
           <Code size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 truncate font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)]">
            <span className="text-[var(--color-accent-primary)]">▮</span>
            {t('chat.script_editor')}
            <span className="hidden text-[var(--color-text-muted)] sm:inline">// script.sk</span>
          </h2>
          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            {lineCount > 0 ? `${String(lineCount).padStart(3, '0')} ${t('editor.lines')} · Rev 2.1` : t('chat.status_ready')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onGUIBuilderToggle && (
          <Button
            onClick={onGUIBuilderToggle}
            variant={isGUIBuilderOpen ? 'primary' : 'secondary'}
            size="sm"
            className={`text-[10px] uppercase tracking-widest ${isGUIBuilderOpen ? 'text-[var(--color-bg-primary)]' : ''}`}
          >
            <Layout size={12} />
            GUI
          </Button>
        )}

        <Button
          onClick={handleCopy}
          disabled={!code.trim()}
          variant="secondary" size="sm" className="text-[10px] uppercase tracking-widest"
        >
          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
          {copied ? t('general.copied') : t('general.copy')}
        </Button>

        <Button
          onClick={handleCloudSave}
          disabled={!code.trim() || isSaving}
          variant="secondary" size="sm" className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)]"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Cloud size={12} />}
          {isSaving ? t('editor.saving') : t('editor.save_to_cloud')}
        </Button>
        
        <DownloadButton code={code} />
        
        <Button
          onClick={() => setIsGitHubOpen(true)}
          disabled={!code.trim()}
          variant="secondary" size="sm" className="text-[10px] uppercase tracking-widest"
        >
          <GithubIcon />
          GitHub
        </Button>

        <Button
          onClick={() => setIsGalleryOpen(true)}
          disabled={!code.trim()}
          variant="primary" size="sm" className="px-4 py-2 text-[10px] uppercase tracking-widest"
        >
          <Share2 size={14} />
          {t('gallery.post').toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
