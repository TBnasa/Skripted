'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useTranslation';
import DownloadButton from './DownloadButton';
import GalleryPostModal from './GalleryPostModal';
import GitHubExportModal from './GitHubExportModal';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';
import type { editor } from 'monaco-editor';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Cloud, Share2, Copy, Loader2, Sparkles, Code, Undo2, Redo2, ClipboardPaste, ArrowRightToLine, CheckCircle2 } from 'lucide-react';
import { setupSkriptLinter } from '@/lib/skript-linter';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const Github = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface EditorPanelProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly isStreaming?: boolean;
}

export default function EditorPanel({ code, onCodeChange, isStreaming }: EditorPanelProps) {
  const { t, mounted } = useTranslation();
  const { userId } = useAuth();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const triggerAction = (actionId: string) => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', actionId, null);
      editorRef.current.focus();
    }
  };

  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editorInstance;

      registerSkriptLanguage(monaco);
      monaco.editor.setTheme('skripted-dark');

      const model = editorInstance.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, SKRIPT_LANGUAGE_ID);
        
        // Setup the Skript Linter
        setupSkriptLinter(editorInstance, monaco);
      }
    },
    [],
  );

  useEffect(() => {
    // Check for code sent from Bulut Scriptlerim
    const pendingCode = localStorage.getItem('skripted_active_code');
    if (pendingCode) {
      onCodeChange(pendingCode);
      localStorage.removeItem('skripted_active_code');
      toast.success(t('editor.loaded_from_cloud'));
    }
  }, [onCodeChange, t]);

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code) {
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  const handleCopy = useCallback(async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(t('general.copied'));
    setTimeout(() => setCopied(false), 2000);
  }, [code, t]);

  const handleCloudSave = async () => {
    if (!userId) {
      toast.error(t('dashboard.please_login'));
      return;
    }
    if (!code.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Script ${new Date().toLocaleDateString(t('general.locale'))}`,
          content: code,
          version: '1.0.0'
        })
      });

      if (!res.ok) throw new Error(t('general.error'));
      
      toast.success(t('editor.saved_to_cloud'));
    } catch {
      toast.error(t('general.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return <div className="flex flex-1 flex-col min-h-0 glass-panel m-2 rounded-2xl bg-[#0a0a0a]" />;

  return (
    <div className="flex flex-1 flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
             <Code size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('chat.script_editor')}</h2>
            <p className="text-[10px] font-mono text-emerald-500/50 mt-0.5 uppercase tracking-widest italic">
              {code.trim() ? `${code.split('\n').length} ${t('editor.lines')}` : t('chat.status_ready')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 rounded-xl transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-30 active:scale-95"
          >
            {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? t('general.copied') : t('general.copy')}
          </button>

          {/* Cloud Save Button */}
          <button
            onClick={handleCloudSave}
            disabled={!code.trim() || isSaving}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 rounded-xl transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 disabled:opacity-30 active:scale-95"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Cloud size={12} />}
            {isSaving ? t('editor.saving') : t('editor.save_to_cloud')}
          </button>
          
          <DownloadButton code={code} />
          
          {/* GitHub Export Button */}
          <button
            onClick={() => setIsGitHubOpen(true)}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 rounded-xl transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-30 active:scale-95"
          >
            <Github size={12} />
            GitHub
          </button>

          {/* Share Button */}
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
      
      {/* Editor & Panel Region */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden [overflow-anchor:none] bg-[#0a0a0a] relative">
          <Editor
            height="100%"
            defaultLanguage={SKRIPT_LANGUAGE_ID}
            value={code}
            onChange={(value) => onCodeChange(value ?? '')}
            onMount={handleEditorMount}
            theme="skripted-dark"
            options={{
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
              fontLigatures: true,
              lineHeight: 22.4,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 4,
              insertSpaces: false,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              padding: { top: 20, bottom: 60 },
              roundedSelection: true,
              readOnly: false,
              automaticLayout: true,
              contextmenu: false,
            }}
          />
          
          {/* Mobile Touch Toolbar */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-[#141414]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl z-10">
            <button onClick={() => triggerAction('undo')} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"><Undo2 size={16} /></button>
            <button onClick={() => triggerAction('redo')} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"><Redo2 size={16} /></button>
            <div className="w-px h-6 bg-white/[0.06] mx-1"></div>
            <button onClick={() => triggerAction('editor.action.clipboardPasteAction')} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"><ClipboardPaste size={16} /></button>
            <button onClick={() => triggerAction('editor.action.formatDocument')} className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl active:scale-90 transition-all font-bold text-[10px] uppercase tracking-widest"><Sparkles size={16} /></button>
            <button onClick={() => {
              if (editorRef.current) {
                editorRef.current.trigger('keyboard', 'tab', null);
                editorRef.current.focus();
              }
            }} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl active:scale-90 transition-all"><ArrowRightToLine size={16} /></button>
          </div>
        </div>
      </div>

      <GalleryPostModal
        code={code}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSuccess={(id) => {
          window.open(`/gallery/${id}`, '_blank');
        }}
      />

      <GitHubExportModal
        code={code}
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />
    </div>
  );
}

