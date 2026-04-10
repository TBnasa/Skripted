'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/useTranslation';
import DownloadButton from './DownloadButton';
import { SKRIPT_LANGUAGE_ID, skriptTokensProvider, skriptTheme } from '@/lib/skript-language';
import type { editor } from 'monaco-editor';

// Dynamic import to avoid SSR issues with Monaco
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorPanelProps {
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
}

export default function EditorPanel({ code, onCodeChange }: EditorPanelProps) {
  const { t } = useTranslation();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [showInsight, setShowInsight] = useState(false);

  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editorInstance;

      // Register Skript language
      monaco.languages.register({ id: SKRIPT_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(SKRIPT_LANGUAGE_ID, skriptTokensProvider);

      // Register Skripted theme
      monaco.editor.defineTheme('skripted-dark', skriptTheme);
      monaco.editor.setTheme('skripted-dark');

      // Set editor model language
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
            
            // Check missing colon for block starters
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
            
            // Check invalid variable formatting like { %var% } instead of %var% or %{var}%
            if (line.match(/\{\s*%.*?%\s*\}/)) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: 'Live Logic Guard: Hatalı değişken formatı. Skript değişkenleri için "%değişken%" kullanın.',
                startLineNumber: lineNum,
                startColumn: 1,
                endLineNumber: lineNum,
                endColumn: line.length + 1,
              });
            }
            
            // Check indentation (space instead of tab warning if starts with 1-3 spaces)
            if (line.match(/^[ ]{1,3}[^ ]/)) {
              markers.push({
                severity: monaco.MarkerSeverity.Warning,
                message: 'Live Logic Guard: Hatalı boşluklandırma (Indentation). 1 Tab = 4 Boşluk veya 1 Tab tuşu olmalıdır.',
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

  // Update editor content when code prop changes
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

  const handleVerify = useCallback(async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setAiReport(null);
    setShowInsight(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await res.json();
      if (res.ok && data.status) {
        setAiReport(data);
      } else {
        setAiReport({ status: 'Critical Error', message: data.message || 'API Hatası', issues: [] });
      }
    } catch (e) {
      setAiReport({ status: 'Critical Error', message: 'Verification failed to respond.', issues: [] });
    }
    
    setVerifying(false);
  }, [code]);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-4 border-black bg-[var(--color-accent-warning)] text-black shadow-[2px_2px_0_#000]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">{t('script_editor')}</h2>
            <p className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)] mt-1">
              {code.trim() ? `${code.split('\n').length} lines` : t('waiting_generation')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!code.trim()}
            className="mc-btn flex items-center gap-2 bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-success)" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t('copied')}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                  <rect x="9" y="9" width="13" height="13" /><path d="M5 15H4V4h9v1" />
                </svg>
                {t('copy')}
              </>
            )}
          </button>


          {/* Download button */}
          <DownloadButton code={code} />
        </div>
      </div>
      
      {/* Editor & Panel Region */}
      <div className="relative flex-1 overflow-hidden bg-black flex">
        {/* AI Expert Insight Panel */}
        {showInsight && (
          <div className="w-96 h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-bg-tertiary)] shadow-[8px_0_32px_rgba(0,0,0,0.3)] flex flex-col z-10 animate-fade-in relative">
            <div className="flex items-center justify-between bg-[var(--color-bg-primary)] p-4 border-b border-[var(--color-bg-tertiary)]">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--color-text-primary)] uppercase">
                  {t('ai_expert_insight')}
                </h3>
              </div>
              <button 
                onClick={() => setShowInsight(false)} 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 py-6 flex flex-col gap-6 text-sm custom-scrollbar">
              {verifying ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="h-10 w-10 border-2 border-[var(--color-bg-tertiary)] border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
                  <p className="text-[var(--color-text-muted)] font-mono text-xs uppercase tracking-widest animate-pulse">{t('scanning_code')}</p>
                </div>
              ) : aiReport ? (
                <>
                  <div className={`p-4 rounded-lg flex items-center gap-3 border transition-all ${
                    aiReport.status === 'Safe' ? 'bg-[var(--color-accent-success)]/10 border-[var(--color-accent-success)]/30 text-[var(--color-accent-success)]' :
                    aiReport.status === 'Warning' ? 'bg-[var(--color-accent-warning)]/10 border-[var(--color-accent-warning)]/30 text-[var(--color-accent-warning)]' :
                    'bg-[var(--color-accent-error)]/10 border-[var(--color-accent-error)]/30 text-[var(--color-accent-error)]'
                  }`}>
                    <div className="shrink-0">
                      {aiReport.status === 'Safe' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : aiReport.status === 'Warning' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase tracking-widest">
                        {aiReport.status === 'Safe' ? t('safe') : aiReport.status === 'Warning' ? t('warning') : t('critical_error')}
                      </p>
                      <p className="text-xs opacity-90 mt-0.5">{aiReport.message}</p>
                    </div>
                  </div>

                  {aiReport.addons && aiReport.addons.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">{t('required_addons')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aiReport.addons.map((addon: string, idx: number) => (
                          <span key={idx} className="bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 text-[10px] font-mono text-[var(--color-accent-secondary)] rounded-md border border-[var(--color-bg-elevated)]">
                            {addon}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">{t('analysis_details')}</p>
                    </div>
                    <div className="grid gap-2">
                      {aiReport.issues && aiReport.issues.length > 0 ? aiReport.issues.map((issue: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-lg bg-[var(--color-bg-tertiary)]/30 border-l-4 text-xs ${
                          issue.type === 'Critical' ? 'border-[var(--color-accent-error)]' :
                          issue.type === 'Warning' ? 'border-[var(--color-accent-warning)]' :
                          'border-[var(--color-accent-success)]'
                        }`}>
                          <p className="text-[var(--color-text-primary)] leading-relaxed">{issue.message}</p>
                        </div>
                      )) : (
                        <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]/20 border-l-4 border-[var(--color-accent-success)] text-xs text-[var(--color-text-muted)] italic">
                          No issues detected by the engine.
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
        <div className="flex-1 h-full overflow-hidden bg-black [overflow-anchor:none]">
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
                lineHeight: 22.4, // 1.6 * 14px
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                insertSpaces: false,
                renderLineHighlight: 'gutter',
                cursorBlinking: 'solid',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 20, bottom: 60 }, // Extra padding at bottom
                roundedSelection: true,
                readOnly: false,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black engine-bg">
              <div className="text-center bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] p-8 shadow-xl rounded-2xl max-w-sm mx-auto">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] shadow-sm">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <p className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                  {t('appear_here')}
                </p>
                <p className="mt-4 text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-widest animate-pulse">
                  {t('status_ready')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
