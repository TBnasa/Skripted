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
    <div className="animate-fade-in-scale mx-auto mt-4 max-w-md">
      <div className="glass-card p-5">
        <p className="mb-4 text-center text-sm font-medium text-[var(--color-text-secondary)]">
          Did the generated script work?
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSuccess}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-all duration-300 hover:bg-emerald-500/15 hover:border-emerald-500/25 hover:scale-[1.02]"
          >
            ✅ It Worked!
          </button>
          <button
            onClick={handleError}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/8 border border-red-500/15 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/15 hover:border-red-500/25 hover:scale-[1.02]"
          >
            ❌ Got an Error
          </button>
        </div>

        {showErrorInput && (
          <div className="animate-fade-in mt-4">
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste your console error here (optional)..."
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-black/30 p-3 font-mono text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-red-500/30 focus:outline-none transition-colors"
              rows={4}
            />
            <button
              onClick={handleError}
              className="mt-2 w-full rounded-xl bg-red-500/10 border border-red-500/15 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/15"
            >
              Submit Error Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
