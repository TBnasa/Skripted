'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, Loader2, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { SKRIPT_LANGUAGE_ID, skriptTokensProvider, skriptTheme } from '@/lib/skript-language';

interface QuickEditModalProps {
  readonly script: { id?: string; title: string; content: string; version?: string } | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (title: string, content: string, version: string) => Promise<void>;
  readonly isSaving: boolean;
}

export default function QuickEditModal({ script, isOpen, onClose, onSave, isSaving }: QuickEditModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0.0');

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
  }, [script, isOpen]);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('skripted-dark', skriptTheme);
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === SKRIPT_LANGUAGE_ID)) {
      monaco.languages.register({ id: SKRIPT_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(SKRIPT_LANGUAGE_ID, skriptTokensProvider);
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.editor.setTheme('skripted-dark');
  };

  if (!isOpen) return null;

  const isNew = !script?.id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f0f11] border border-white/[0.08] w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] via-transparent to-cyan-500/[0.02] pointer-events-none"></div>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.01] relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-colors ${isNew ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{isNew ? 'Yeni Script Oluştur' : 'Scripti Düzenle'}</h2>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                {isNew ? 'Sıfırdan başla ve hayal gücünü konuştur' : `Düzenlenen: ${script?.title}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Settings Bar */}
          <div className="px-8 py-4 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap items-center gap-4">
             <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Script Başlığı</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Gelişmiş Market Sistemi"
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                />
             </div>
             <div className="w-32">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block ml-1">Versiyon</label>
                <input 
                  type="text" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                />
             </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative bg-[#0a0a0b]">
             <Editor
                height="100%"
                language={SKRIPT_LANGUAGE_ID}
                theme="skripted-dark"
                value={content}
                onChange={(v) => setContent(v || '')}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorMount}
                loading={<div className="flex items-center justify-center h-full bg-[#0a0a0b] text-zinc-500 animate-pulse font-mono text-xs uppercase tracking-widest">Editor Hazırlanıyor...</div>}
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
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01] relative z-10 shrink-0">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
             <AlertCircle size={14} className="text-amber-500/70" />
             <span>Değişiklikleri kaydetmeyi unutmayın!</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                disabled={isSaving}
             >
                Vazgeç
             </button>
             <button 
                onClick={() => onSave(title, content, version)}
                disabled={isSaving || !title || !content}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30 active:scale-95"
             >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Kaydediliyor...' : (isNew ? 'Scripti Oluştur' : 'Değişiklikleri Kaydet')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
