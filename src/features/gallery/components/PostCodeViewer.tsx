'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Copy, CheckCircle2, Shrink, Maximize2 } from 'lucide-react';
import { SKRIPT_LANGUAGE_ID } from '@/lib/skript-language';

interface PostCodeViewerProps {
  code: string;
  t: (key: string) => string;
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
      className={`flex flex-col bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/[0.08] overflow-hidden shadow-2xl ring-1 ring-white/5 transition-all z-50 ${
        isFullscreen 
          ? 'fixed inset-4 md:inset-8 rounded-[2rem]' 
          : 'relative rounded-[2.5rem] min-h-[500px] h-[700px] max-h-[700px]'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
          <span className="ml-3 font-mono text-xs font-bold text-zinc-400 uppercase tracking-widest">script.sk</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-[11px] font-bold text-zinc-300 hover:text-emerald-400 transition-all bg-white/5 hover:bg-emerald-500/10 px-4 py-2 rounded-xl border border-white/5 hover:border-emerald-500/30 group active:scale-95"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
            {copied ? t('general.copied') : t('general.copy')}
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 w-8 h-8 rounded-xl border border-white/5 hover:border-white/20 transition-all active:scale-95"
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
          loading={<div className="flex items-center justify-center h-full bg-[#0a0a0b] text-zinc-500 animate-pulse font-mono text-xs uppercase tracking-widest">{t('gallery.post_content.editor_loading')}</div>}
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
