'use client';

interface FeedbackPollProps {
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly visible: boolean;
}

import { useState } from 'react';

export default function FeedbackPoll({ onFeedback, visible }: FeedbackPollProps) {
  const [showErrorInput, setShowErrorInput] = useState(false);
  const [errorLog, setErrorLog] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!visible || submitted) return null;

  const handleSuccess = () => {
    onFeedback(true);
    setSubmitted(true);
  };

  const handleError = () => {
    if (!showErrorInput) {
      setShowErrorInput(true);
      return;
    }
    onFeedback(false, errorLog);
    setSubmitted(true);
  };

  return (
    <div className="animate-fade-in mx-auto mt-4 max-w-md">
      <div className="glass-card p-4">
        <p className="mb-3 text-center text-sm font-medium text-[var(--color-text-secondary)]">
          Did the generated script work?
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSuccess}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-success)]/15 px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-success)] transition-all duration-200 hover:bg-[var(--color-accent-success)]/25 hover:scale-[1.02]"
          >
            ✅ It Worked!
          </button>
          <button
            onClick={handleError}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-error)]/15 px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-error)] transition-all duration-200 hover:bg-[var(--color-accent-error)]/25 hover:scale-[1.02]"
          >
            ❌ Got an Error
          </button>
        </div>

        {showErrorInput && (
          <div className="animate-fade-in mt-3">
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste your console error here (optional)..."
              className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 font-[var(--font-mono)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-error)] focus:outline-none"
              rows={4}
            />
            <button
              onClick={handleError}
              className="mt-2 w-full rounded-lg bg-[var(--color-accent-error)]/20 px-4 py-2 text-sm font-semibold text-[var(--color-accent-error)] transition-colors duration-200 hover:bg-[var(--color-accent-error)]/30"
            >
              Submit Error Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
