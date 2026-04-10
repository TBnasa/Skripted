'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-4 border-black bg-[var(--color-accent-warning)] text-black shadow-[2px_2px_0_#000]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]" style={{ fontFamily: '"Press Start 2P", cursive' }}>Script Editor</h2>
            <p className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--color-text-muted)] mt-1">
              {code.trim() ? `${code.split('\n').length} lines` : 'Waiting for generation...'}
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
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                  <rect x="9" y="9" width="13" height="13" /><path d="M5 15H4V4h9v1" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={!code.trim() || verifying}
            className="mc-btn flex items-center gap-2 bg-[var(--color-bg-tertiary)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent-primary)] transition-all hover:bg-[var(--color-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale"
          >
            {verifying ? 'Verifying...' : 'Verify Syntax'}
          </button>

          {/* Download button */}
          <DownloadButton code={code} />
        </div>
      </div>
      
      {/* Editor & Panel Region */}
      <div className="relative flex-1 overflow-hidden bg-black flex">
        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          {code.trim() ? (
            <Editor
              height="100%"
              defaultLanguage={SKRIPT_LANGUAGE_ID}
              value={code}
              onChange={(value) => onCodeChange(value ?? '')}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 16,
                fontFamily: '"VT323", monospace',
                fontLigatures: false,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                insertSpaces: false,
                renderLineHighlight: 'gutter',
                cursorBlinking: 'solid',
                cursorSmoothCaretAnimation: 'off',
                smoothScrolling: false,
                padding: { top: 16, bottom: 16 },
                roundedSelection: false,
                readOnly: false,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black engine-bg">
              <div className="text-center bg-[var(--color-bg-secondary)] border-4 border-black p-8 shadow-[8px_8px_0_#000]">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-4 border-black bg-[var(--color-bg-tertiary)] shadow-[inset_4px_4px_0_rgba(0,0,0,0.5)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <p className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)]" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px', lineHeight: '2' }}>
                  Generated script will<br/>appear here
                </p>
                <p className="mt-4 text-sm font-mono text-[var(--color-accent-primary)] uppercase tracking-widest">
                  Waiting for input...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Expert Insight Panel */}
        {showInsight && (
          <div className="w-80 h-full bg-[var(--color-bg-secondary)] border-l-4 border-black shadow-[-8px_0_16px_rgba(0,0,0,0.5)] flex flex-col z-10 animate-fade-in relative">
            <div className="flex items-center justify-between bg-[var(--color-bg-elevated)] p-3 border-b border-black">
              <h3 className="text-sm font-bold tracking-widest text-[var(--color-text-primary)] uppercase" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '9px' }}>
                AI Expert Insight
              </h3>
              <button onClick={() => setShowInsight(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-sm">
              {verifying ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="h-8 w-8 animate-spin border-4 border-[var(--color-bg-tertiary)] border-t-[var(--color-accent-primary)] rounded-full"></div>
                  <p className="text-[var(--color-text-secondary)] font-mono uppercase tracking-widest text-xs">Scanning Code...</p>
                </div>
              ) : aiReport ? (
                <>
                  <div className={`p-4 border-2 border-black shadow-[4px_4px_0_#000] font-bold uppercase tracking-widest ${
                    aiReport.status === 'Safe' ? 'bg-[var(--color-accent-success)] text-black' :
                    aiReport.status === 'Warning' ? 'bg-[var(--color-accent-warning)] text-black' :
                    'bg-[var(--color-accent-error)] text-black'
                  }`}>
                    {aiReport.status === 'Safe' ? '✅ Güvenli' : aiReport.status === 'Warning' ? '⚠️ Uyarı' : '❌ Kritik Hata'}
                  </div>

                  <p className="font-mono text-[var(--color-text-primary)] mb-2 px-1 text-xs">
                    {aiReport.message}
                  </p>

                  {aiReport.addons && aiReport.addons.length > 0 && (
                    <div className="border border-[var(--color-bg-tertiary)] p-3 rounded bg-[var(--color-bg-primary)]">
                      <p className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold tracking-widest mb-2 border-b border-[var(--color-bg-tertiary)] pb-1">Required Addons</p>
                      <div className="flex flex-wrap gap-2">
                        {aiReport.addons.map((addon: string, idx: number) => (
                          <span key={idx} className="bg-[var(--color-bg-elevated)] px-2 py-0.5 text-xs font-mono text-[var(--color-accent-secondary)] rounded">
                            {addon}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiReport.issues && aiReport.issues.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold tracking-widest mt-2">Analysis Details</p>
                      {aiReport.issues.map((issue: any, idx: number) => (
                        <div key={idx} className={`p-3 border-l-4 text-xs font-mono bg-[var(--color-bg-primary)] ${
                          issue.type === 'Critical' ? 'border-[var(--color-accent-error)]' :
                          issue.type === 'Warning' ? 'border-[var(--color-accent-warning)]' :
                          'border-[var(--color-accent-success)]'
                        }`}>
                          {issue.message}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
