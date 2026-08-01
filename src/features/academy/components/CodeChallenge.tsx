'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { useAcademyStore } from '@/store/useAcademyStore';
import { Play, RotateCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface CodeChallengeProps {
  readonly starterCode: string;
  readonly solutionCode: string;
  readonly onValidate: (userCode: string) => Promise<{ correct: boolean; feedback: string }> | { correct: boolean; feedback: string };
}

export function CodeChallenge({ starterCode, solutionCode, onValidate }: CodeChallengeProps) {
  const { lang } = useTranslation();
  const isTr = lang === 'tr';
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);

  // Sync current code to global store
  const store = useAcademyStore();
  useEffect(() => {
    store.setCurrentCode(code);
  }, [code, store]);

  // Sync line numbers
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCheck = useCallback(async () => {
    setIsValidating(true);
    try {
      const res = await onValidate(code);
      setResult(res);
      store.setLastValidationResult(res);
    } catch (err) {
      setResult({ correct: false, feedback: isTr ? 'Doğrulama hatası!' : 'Validation error!' });
    } finally {
      setIsValidating(false);
    }
  }, [code, onValidate, isTr, store]);

  const handleReset = useCallback(() => {
    setCode(starterCode);
    setResult(null);
  }, [starterCode]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle Tab key for indentation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '\t' + code.substring(end);
      setCode(newCode);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }
  }, [code]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-primary)]/60" />
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-primary)]/60" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] font-mono">
            challenge.sk
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-secondary)] 
                       bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-glow)] rounded-lg border border-[var(--color-border)] transition-all"
          >
            <RotateCcw size={12} />
            {isTr ? 'Sıfırla' : 'Reset'}
          </button>
          <button
            onClick={handleCheck}
            disabled={isValidating}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold text-white 
                       bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] rounded-lg transition-all active:scale-95
                       ink-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
            {isTr ? 'Kontrol Et' : 'Check'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div
          ref={lineNumberRef}
          className="w-12 shrink-0 bg-[var(--color-bg-tertiary)] overflow-hidden select-none border-r border-[var(--color-border)] pt-4 px-1"
        >
          {lineNumbers.map(n => (
            <div key={n} className="text-right pr-2 text-[11px] font-mono text-[var(--color-text-muted)] leading-[1.7]">
              {n}
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => { setCode(e.target.value); setResult(null); }}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 bg-transparent text-[var(--color-text-primary)] font-mono text-[13px] leading-[1.7] p-4 
                     resize-none outline-none overflow-auto custom-scrollbar
                     caret-[var(--color-text-primary)] selection:bg-[var(--color-accent-primary)]/30"
          style={{ tabSize: 4 }}
        />
      </div>

      {/* Result Bar */}
      {result && (
        <div className={`flex items-center gap-3 px-4 py-3 border-t transition-all ${
          result.correct
            ? 'bg-[var(--color-accent-glow)] border-[var(--color-border-hover)]'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          {result.correct ? (
            <CheckCircle2 size={18} className="text-[var(--color-text-primary)] shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-400 shrink-0" />
          )}
          <p className={`text-xs font-medium ${result.correct ? 'text-[var(--color-text-primary)]' : 'text-red-400'}`}>
            {result.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
