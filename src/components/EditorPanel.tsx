'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useTranslation';
import DownloadButton from './DownloadButton';
import GalleryPostModal from './GalleryPostModal';
import { SKRIPT_LANGUAGE_ID, skriptTokensProvider, skriptTheme } from '@/lib/skript-language';
import type { editor } from 'monaco-editor';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorPanelProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly isStreaming?: boolean;
}

export default function EditorPanel({ code, onCodeChange, isStreaming }: EditorPanelProps) {
  const { t } = useTranslation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editorInstance;

      monaco.languages.register({ id: SKRIPT_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(SKRIPT_LANGUAGE_ID, skriptTokensProvider);
      monaco.editor.defineTheme('skripted-dark', skriptTheme);
      monaco.editor.setTheme('skripted-dark');

      const model = editorInstance.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, SKRIPT_LANGUAGE_ID);
        
        // Live Logic Guard (Linter)
        editorInstance.onDidChangeModelContent(() => {
          const lines = model.getLinesContent();
          const markers: editor.IMarkerData[] = [];
          
          lines.forEach((line, i) => {
            const lineNum = i + 1;
            const trimmed = line.trim();
            
            const blockStarters = ['on ', 'command ', 'function ', 'trigger', 'every ', 'choose '];
            if (blockStarters.some(s => trimmed.startsWith(s)) && !trimmed.endsWith(':')) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: 'Live Logic Guard: Eksik ":" - Skript blokları iki nokta ile bitmelidir.',
                startLineNumber: lineNum,
                startColumn: 1,
                endLineNumber: lineNum,
                endColumn: line.length + 1,
              });
            }
            
            if (line.match(/\{\s*%.*?%\s*\}/)) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: 'Live Logic Guard: Hatalı değişken formatı.',
                startLineNumber: lineNum,
                startColumn: 1,
                endLineNumber: lineNum,
                endColumn: line.length + 1,
              });
            }
            
            if (line.match(/^[ ]{1,3}[^ ]/)) {
              markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: 'Live Logic Guard: Hatalı boşluklandırma.',
                startLineNumber: lineNum,
                startColumn: 1,
                endLineNumber: lineNum,
                endColumn: line.length + 1,
              });
            }
          });
          
          monaco.editor.setModelMarkers(model, 'skript-guard', markers);
        });
      }
    },
    [],
  );

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
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="flex flex-1 flex-col min-h-0 glass-panel overflow-hidden m-2 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{t('script_editor')}</h2>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
              {code.trim() ? `${code.split('\n').length} lines` : t('waiting_generation')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!code.trim()}
            className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-[11px] font-medium text-[var(--color-text-secondary)] rounded-xl transition-all duration-300 hover:bg-white/[0.06] hover:text-[var(--color-text-primary)] disabled:opacity-30"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t('copied')}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {t('copy')}
              </>
            )}
          </button>
          <DownloadButton code={code} />
          <button
            onClick={() => setIsGalleryOpen(true)}
            disabled={!code.trim()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 px-3 py-2 text-[11px] font-medium text-emerald-400 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-30 disabled:hover:shadow-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>
      </div>
      
      {/* Editor & Panel Region */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* AI Expert Insight Panel */}
        {showInsight && (
          <div className="w-96 h-full bg-[var(--color-bg-secondary)] border-r border-white/[0.04] flex flex-col z-10 animate-slide-left">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3 className="text-xs font-semibold tracking-wider text-[var(--color-text-primary)] uppercase">
                  {t('ai_expert_insight')}
                </h3>
              </div>
              <button onClick={() => setShowInsight(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-white/[0.05] p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-sm custom-scrollbar">
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="h-8 w-8 border-2 border-white/[0.06] border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-[var(--color-text-muted)] font-mono text-xs uppercase tracking-widest">{t('scanning_code')}</p>
                </div>
              ) : aiReport ? (
                <>
                  <div className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${
                    aiReport.status === 'Safe' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                    aiReport.status === 'Warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                    'bg-red-500/5 border-red-500/20 text-red-400'
                  }`}>
                    <div className="shrink-0">
                      {aiReport.status === 'Safe' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider">{aiReport.status === 'Safe' ? t('safe') : aiReport.status === 'Warning' ? t('warning') : t('critical_error')}</p>
                      <p className="text-xs opacity-80 mt-0.5">{aiReport.message}</p>
                    </div>
                  </div>

                  {aiReport.addons?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-medium tracking-widest text-[var(--color-text-muted)]">{t('required_addons')}</p>
                      <div className="flex flex-wrap gap-2">
                        {aiReport.addons.map((addon: string, idx: number) => (
                          <span key={idx} className="bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-emerald-400/80 rounded-lg border border-white/[0.04]">
                            {addon}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-medium tracking-widest text-[var(--color-text-muted)]">{t('analysis_details')}</p>
                    <div className="grid gap-2">
                      {aiReport.issues?.length > 0 ? aiReport.issues.map((issue: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-xl bg-white/[0.02] border-l-2 text-xs ${
                          issue.type === 'Critical' ? 'border-red-500' :
                          issue.type === 'Warning' ? 'border-amber-500' : 'border-emerald-500'
                        }`}>
                          <p className="text-[var(--color-text-secondary)] leading-relaxed">{issue.message}</p>
                        </div>
                      )) : (
                        <div className="p-3 rounded-xl bg-white/[0.02] border-l-2 border-emerald-500 text-xs text-[var(--color-text-muted)] italic">
                          No issues detected.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1 h-full overflow-hidden [overflow-anchor:none] bg-transparent">
          {code.trim() ? (
            <Editor
              height="100%"
              defaultLanguage={SKRIPT_LANGUAGE_ID}
              value={code}
              onChange={(value) => onCodeChange(value ?? '')}
              onMount={handleEditorMount}
              theme="vs-dark"
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
                renderLineHighlight: 'gutter',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 20, bottom: 60 },
                roundedSelection: true,
                readOnly: false,
                automaticLayout: true,
              }}
            />
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
            <div className="flex h-full items-center justify-center bg-[#0a0a0a] mesh-gradient">
              <div className="text-center max-w-sm mx-auto animate-fade-in">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] text-[var(--color-text-muted)] animate-float border border-white/[0.04]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-[var(--color-text-secondary)]">
                  {t('appear_here')}
                </p>
                <p className="mt-3 text-xs font-mono text-emerald-500/50 uppercase tracking-widest">
                  {t('status_ready')}
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
