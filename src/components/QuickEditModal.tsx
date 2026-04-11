'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, Save, Loader2, CheckCircle2, AlertCircle, FileCode, Clock, RotateCcw, History, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { SKRIPT_LANGUAGE_ID, registerSkriptLanguage } from '@/lib/skript-language';

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
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

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
      toast.error('Versiyon geçmişi yüklenemedi');
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
    if (confirm('Bu versiyonu geri yüklemek istediğinize emin misiniz? Mevcut düzenlemeleriniz silinecek.')) {
      setContent(oldContent);
      setIsHistoryOpen(false);
      toast.success('Versiyon başarıyla yüklendi!');
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    registerSkriptLanguage(monaco);
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
          <div className="flex items-center gap-2">
            {!isNew && (
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${isHistoryOpen ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'text-zinc-500 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'}`}
                title="Versiyon Geçmişi"
              >
                <Clock size={20} />
                <span className="hidden sm:inline">Geçmiş</span>
              </button>
            )}
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
              <X size={24} />
            </button>
          </div>
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

          {/* Version History Sidebar */}
          {isHistoryOpen && (
            <div className="absolute top-0 right-0 w-80 h-full bg-[#0d0d0f] border-l border-white/[0.08] shadow-2xl z-20 flex flex-col animate-slide-left">
               <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                     <History size={16} />
                     Versiyon Geçmişi
                  </h3>
                  <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                     <X size={18} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {isLoadingVersions ? (
                     <div className="flex flex-col items-center justify-center h-40 text-zinc-600 italic gap-3">
                        <Loader2 size={32} className="animate-spin text-emerald-500" />
                        <span className="text-xs uppercase tracking-[0.2em]">Yükleniyor...</span>
                     </div>
                  ) : versions.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-40 text-zinc-600 italic gap-3 text-center px-4">
                        <Clock size={32} className="opacity-20" />
                        <span className="text-xs">Henüz kayıtlı bir versiyon bulunmuyor. Her kaydettiğinizde bir snapshot alınır.</span>
                     </div>
                  ) : (
                     versions.map((v, i) => (
                        <div key={v.id} className="group p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:border-emerald-500/30 transition-all">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                 {i === 0 ? 'Son Kayıt' : `Versiyon #${versions.length - i}`}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                                 <Calendar size={10} />
                                 {new Date(v.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                           </div>
                           <p className="text-[9px] text-zinc-600 mb-3 truncate font-mono">
                              {new Date(v.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </p>
                           <button 
                              onClick={() => handleRestore(v.content)}
                              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                           >
                              <RotateCcw size={12} />
                              Geri Yükle
                           </button>
                        </div>
                     ))
                  )}
               </div>
               
               <div className="p-4 border-t border-white/[0.08] bg-black/20 italic text-[10px] text-zinc-600 text-center">
                  Snapshotlar otomatik olarak oluşturulur.
               </div>
            </div>
          )}
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
