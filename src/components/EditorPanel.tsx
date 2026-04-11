'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useTranslation';
import DownloadButton from './DownloadButton';
import GalleryPostModal from './GalleryPostModal';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';
import type { editor } from 'monaco-editor';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Cloud, Save, Share2, Copy, FileCode, Loader2, Sparkles, AlertCircle, ChevronRight, Code, Undo2, Redo2, ClipboardPaste, ArrowRightToLine, CheckCircle2 } from 'lucide-react';
import { setupSkriptLinter } from '@/lib/skript-linter';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorPanelProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly isStreaming?: boolean;
}

export default function EditorPanel({ code, onCodeChange, isStreaming }: EditorPanelProps) {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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
      toast.success('Script buluttan yüklendi!');
    }
  }, [onCodeChange]);

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
    toast.success('Panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleCloudSave = async () => {
    if (!userId) {
      toast.error('Giriş yapmalısınız!');
      return;
    }
    if (!code.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Script ${new Date().toLocaleDateString('tr-TR')}`,
          content: code,
          version: '1.0.0'
        })
      });

      if (!res.ok) throw new Error('Yükleme başarısız');
      
      toast.success('Script bulut hesabınıza kaydedildi!');
    } catch (err) {
      toast.error('Kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
             <Code size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('script_editor')}</h2>
            <p className="text-[10px] font-mono text-emerald-500/50 mt-0.5 uppercase tracking-widest italic">
              {code.trim() ? `${code.split('\n').length} Satır` : 'Sistem Hazır'}
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
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>

          {/* Cloud Save Button */}
          <button
            onClick={handleCloudSave}
            disabled={!code.trim() || isSaving}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 rounded-xl transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 disabled:opacity-30 active:scale-95"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Cloud size={12} />}
            {isSaving ? 'Kaydediliyor' : 'Buluta Kaydet'}
          </button>
          
          <DownloadButton code={code} />
          
          {/* Share Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            disabled={!code.trim()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-95 disabled:opacity-30"
          >
            <Share2 size={14} />
            YAYINLA
          </button>
        </div>
      </div>
      
      {/* Editor & Panel Region */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden [overflow-anchor:none] bg-transparent relative">
          {code.trim() ? (
            <>
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
            </>
          ) : isStreaming ? (
            <div className="flex h-full w-full flex-col p-8 bg-[#0a0a0a]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 mb-4 animate-pulse" style={{ opacity: 0.6 - i * 0.1, animationDelay: `${i * 0.1}s` }}>
                  <div className="w-6 h-4 shimmer-bg rounded"></div>
                  <div className={`h-4 shimmer-bg rounded ${i % 2 === 0 ? 'w-48 ml-8' : 'w-64'}`}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-[#0a0a0a] mesh-gradient relative">
               <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none"></div>
              <div className="text-center max-w-sm mx-auto animate-fade-in relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[2rem] bg-white/[0.03] text-emerald-500/30 animate-float border border-white/[0.04] shadow-2xl">
                  <FileCode size={32} />
                </div>
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">{t('status_ready')}</h3>
                <p className="text-xs font-medium text-zinc-700 max-w-[200px] mx-auto leading-relaxed italic">
                  Sol taraftaki terminali kullanarak kod üretmeye başlayabilirsin.
                </p>
              </div>
            </div>
          )}
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
    </div>
  );
}

