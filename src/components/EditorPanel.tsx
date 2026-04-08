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
  const [verifyResult, setVerifyResult] = useState<{ status: 'success' | 'working' | 'error', message: string } | null>(null);

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
    setVerifyResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await res.json();
      if (res.ok && data.valid) {
        setVerifyResult({ status: 'success', message: 'Script is compatible with Paper 1.21.1!' });
      } else {
        setVerifyResult({ status: 'error', message: data.message || 'Syntax errors found. Re-prompt AI to fix.' });
      }
    } catch (e) {
      setVerifyResult({ status: 'error', message: 'Verification failed to run.' });
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
      
      {/* Verification Result Toast */}
      {verifyResult && (
        <div className={`flex items-center border-b-4 border-black px-5 py-3 text-sm font-bold uppercase tracking-widest shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] ${
          verifyResult.status === 'success' 
            ? 'bg-[var(--color-accent-success)] text-black' 
            : 'bg-[var(--color-accent-error)] text-black'
        }`}>
          <span style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '12px' }}>{verifyResult.status === 'success' ? 'VALID' : 'ERROR'}</span>
          <span className="ml-4 flex-1">{verifyResult.message}</span>
          <button onClick={() => setVerifyResult(null)} className="ml-auto opacity-60 hover:opacity-100 font-mono text-xl">✕</button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden bg-black">
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
    </div>
  );
}
