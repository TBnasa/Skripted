'use client';

import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Copy, CheckCircle2, Shrink, Maximize2 } from 'lucide-react';
import { SKRIPT_LANGUAGE_ID } from '@/lib/skript-language';

interface PostCodeViewerProps {
  code: string;
  t: (key: string, options?: Record<string, unknown>) => string;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  handleCopy: () => void;
  copied: boolean;
  handleEditorWillMount: (monaco: any) => void;
  handleEditorMount: (editor: any, monaco: any) => void;
}

export function PostCodeViewer({
  code,
  t,
  isFullscreen,
  setIsFullscreen,
  handleCopy,
  copied,
  handleEditorWillMount,
  handleEditorMount,
}: PostCodeViewerProps) {
  return (
    <motion.div 
      layout
      className={`flex flex-col bg-[var(--color-bg-secondary)] backdrop-blur-2xl border border-[var(--color-border)] overflow-hidden ink-shadow-lg transition-all z-50 ${
        isFullscreen 
          ? 'fixed inset-4 md:inset-8 rounded-xl' 
          : 'relative rounded-xl min-h-[500px] h-[700px] max-h-[700px]'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-text-muted)] border border-[var(--color-border)]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-primary)]/80 border border-[var(--color-border-active)]"></div>
          </div>
          <span className="ml-3 font-mono text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">script.sk</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-[11px] font-bold text-[var(--color-text-primary)] transition-all bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-glow)] px-4 py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] group active:scale-95"
          >
            {copied ? <CheckCircle2 size={14} className="text-[var(--color-text-primary)]" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
            {copied ? t('general.copied') : t('general.copy')}
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-glow)] w-8 h-8 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-active)] transition-all active:scale-95"
            title={isFullscreen ? t('general.shrink', { defaultValue: 'Shrink' }) : t('general.fullscreen', { defaultValue: 'Fullscreen' })}
          >
            {isFullscreen ? <Shrink size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      
      <div className={`relative flex-1 ${isFullscreen ? 'h-full' : 'min-h-[500px] h-[600px]'}`}>
        <Editor
          height={isFullscreen ? "100%" : "600px"}
          language={SKRIPT_LANGUAGE_ID}
          theme="skripted-dark"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          value={code}
          loading={<div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] animate-pulse font-mono text-xs uppercase tracking-widest">{t('gallery.post_content.editor_loading')}</div>}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 15,
            lineHeight: 24,
            padding: { top: 24, bottom: 24 },
            fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            smoothScrolling: true,
            contextmenu: false,
            automaticLayout: true,
            tabSize: 4,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            }
          }}
        />
      </div>
    </motion.div>
  );
}
