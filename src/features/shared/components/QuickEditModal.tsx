'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, Loader2, AlertCircle, FileCode, Clock, RotateCcw, History, Calendar, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';
import { setupSkriptLinter } from '@/lib/skript-linter';
import { useTranslation } from '@/lib/useTranslation';
import { AnimatePresence } from 'framer-motion';
import GUIBuilder from '@/features/chat/components/Editor/GUIBuilder';
import { Button } from '@/features/shared/components/ui/Button';

interface QuickEditModalProps {
  readonly script: { id?: string; title: string; content: string; version?: string } | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (title: string, content: string, version: string) => Promise<void>;
  readonly isSaving: boolean;
}

export default function QuickEditModal({ script, isOpen, onClose, onSave, isSaving }: QuickEditModalProps) {
  const { t, mounted } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0.0');

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isGUIBuilderOpen, setIsGUIBuilderOpen] = useState(false);

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
      setVersion(script.version || '1.0.0');
    } else {
      setTitle('');
      setContent('');
      setVersion('1.0.0');
    }
    setIsHistoryOpen(false);
  }, [script, isOpen]);

  const fetchVersions = async () => {
    if (!script?.id) return;
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/user-scripts/${script.id}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      toast.error(t('editor.versions_load_error'));
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (isHistoryOpen) {
      fetchVersions();
    }
  }, [isHistoryOpen]);

  const handleRestore = (oldContent: string) => {
    if (confirm(t('editor.confirm_restore'))) {
      setContent(oldContent);
      setIsHistoryOpen(false);
      toast.success(t('editor.version_loaded'));
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    registerSkriptLanguage(monaco);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.editor.setTheme('vs');
    setupSkriptLinter(editor, monaco);
  };

  const handleGUICodeGenerate = (guiCode: string) => {
    const newCode = content ? `${content}\n\n${guiCode}` : guiCode;
    setContent(newCode);
  };

  if (!isOpen || !mounted) return null;

  const isNew = !script?.id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-scale-up relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-400/[0.02] via-transparent to-zinc-400/[0.02] pointer-events-none"></div>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--color-border-hover)] flex justify-between items-center bg-[var(--color-bg-tertiary)] relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-colors ${isNew ? 'bg-[var(--color-accent-glow)] border-[var(--color-border-hover)] text-[var(--color-text-primary)]' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-hover)] text-[var(--color-text-secondary)]'}`}>
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">{isNew ? t('editor.create_new') : t('editor.edit_script')}</h2>
              <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest mt-1">
                {isNew ? t('editor.start_fresh') : `${t('editor.editing')}: ${script?.title}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => toast.info('GUI Builder Coming Soon!')}
              variant="ghost" size="sm"
              title="GUI Builder"
            >
              <Layout size={20} />
              <span className="hidden sm:inline">GUI</span>
            </Button>
            {!isNew && (
              <Button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                variant="ghost" size="sm"
                className={isHistoryOpen ? 'bg-[var(--color-accent-glow)] border-[var(--color-border-hover)] text-[var(--color-text-primary)]' : ''}
                title={t('editor.version_history')}
              >
                <Clock size={20} />
                <span className="hidden sm:inline">{t('dashboard.history')}</span>
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Settings Bar */}
          <div className="px-8 py-4 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] flex flex-wrap items-center gap-4">
             <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5 block ml-1">{t('gallery.modal.title_label')}</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Gelişmiş Market Sistemi"
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active)] transition-all font-medium"
                />
             </div>
             <div className="w-32">
                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1.5 block ml-1">{t('editor.version_label')}</label>
                <input 
                  type="text" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-active)] transition-all font-mono"
                />
             </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative bg-[var(--color-bg-primary)]">
             <Editor
                height="100%"
                language={SKRIPT_LANGUAGE_ID}
                theme="vs"
                value={content}
                onChange={(v) => setContent(v || '')}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorMount}
                loading={<div className="flex items-center justify-center h-full bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] animate-pulse font-mono text-xs uppercase tracking-widest">{t('editor.preparing')}</div>}
                options={{
                  fontSize: 14,
                  fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  automaticLayout: true,
                  tabSize: 4,
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                }}
             />
          </div>

          {/* Version History Sidebar */}
          {isHistoryOpen && (
            <div className="absolute top-0 right-0 w-80 h-full bg-[var(--color-bg-elevated)] border-l border-[var(--color-border-hover)] shadow-2xl z-20 flex flex-col animate-slide-left">
               <div className="p-6 border-b border-[var(--color-border-hover)] flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-2">
                     <History size={16} />
                     {t('editor.version_history')}
                  </h3>
                  <button onClick={() => setIsHistoryOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
                     <X size={18} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {isLoadingVersions ? (
                     <div className="flex flex-col items-center justify-center h-40 text-[var(--color-text-muted)] italic gap-3">
                        <Loader2 size={32} className="animate-spin text-[var(--color-text-primary)]" />
                        <span className="text-xs uppercase tracking-[0.2em]">{t('general.loading')}</span>
                     </div>
                  ) : versions.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-40 text-[var(--color-text-muted)] italic gap-3 text-center px-4">
                        <Clock size={32} className="opacity-20" />
                        <span className="text-xs">{t('editor.no_history')}</span>
                     </div>
                  ) : (
                     versions.map((v, i) => (
                        <div key={v.id} className="group p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-border-hover)] transition-all">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                                 {i === 0 ? t('editor.last_saved') : `${t('editor.version_label')} #${versions.length - i}`}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                                 <Calendar size={10} />
                                 {new Date(v.created_at).toLocaleTimeString(t('general.locale'), { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                           <p className="text-[9px] text-[var(--color-text-muted)] mb-3 truncate font-mono">
                              {new Date(v.created_at).toLocaleDateString(t('general.locale'), { day: 'numeric', month: 'short', year: 'numeric' })}
                           </p>
                           <button 
                              onClick={() => handleRestore(v.content)}
                              className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--color-accent-glow)] border border-[var(--color-border-hover)] rounded-lg text-[var(--color-text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-accent-primary)] hover:text-[var(--color-bg-primary)] transition-all"
                           >
                              <RotateCcw size={12} />
                              {t('editor.restore')}
                           </button>
                        </div>
                     ))
                  )}
               </div>
               
               <div className="p-4 border-t border-[var(--color-border-hover)] bg-[var(--color-bg-tertiary)] italic text-[10px] text-[var(--color-text-muted)] text-center">
                  {t('editor.snapshots_info')}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[var(--color-border-hover)] flex items-center justify-between bg-[var(--color-bg-tertiary)] relative z-10 shrink-0">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs">
             <AlertCircle size={14} className="text-amber-500/70" />
             <span>{t('editor.dont_forget_save')}</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
                disabled={isSaving}
             >
                {t('general.cancel')}
             </button>
             <button 
                onClick={() => onSave(title, content, version)}
                disabled={isSaving || !title || !content}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-[var(--color-bg-primary)] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ink-shadow-sm disabled:opacity-30 active:scale-95"
             >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? t('editor.saving') : (isNew ? t('editor.create_now') : t('general.save_changes'))}
             </button>
          </div>
        </div>

      <AnimatePresence>
        {isGUIBuilderOpen && (
          <GUIBuilder
            onClose={() => setIsGUIBuilderOpen(false)}
            onCodeGenerate={handleGUICodeGenerate}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
