'use client';

interface FeedbackPollProps {
  readonly onFeedback: (success: boolean, errorLog?: string) => void;
  readonly visible: boolean;
}

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { Check, X } from 'lucide-react';

export default function FeedbackPoll({ onFeedback, visible }: FeedbackPollProps) {
  const { t, mounted } = useTranslation();
  const [showErrorInput, setShowErrorInput] = useState(false);
  const [errorLog, setErrorLog] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!visible || submitted || !mounted) return null;

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
          {t('chat.feedback_question')}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleSuccess}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-glow)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-300 hover:border-[var(--color-border-hover)] hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
            {t('chat.feedback_worked')}
          </button>
          <button
            onClick={handleError}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-error)]/10 border border-[var(--color-accent-error)]/25 px-4 py-2.5 text-sm font-medium text-[var(--color-accent-error)] transition-all duration-300 hover:bg-[var(--color-accent-error)]/15 hover:border-[var(--color-accent-error)]/35 hover:scale-[1.02]"
          >
            <X className="w-4 h-4" />
            {t('chat.feedback_error')}
          </button>
        </div>

        {showErrorInput && (
          <div className="animate-fade-in mt-4">
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder={t('chat.feedback_placeholder')}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-3 font-mono text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-error)]/30 focus:outline-none transition-colors"
              rows={4}
            />
            <button
              onClick={handleError}
              className="mt-2 w-full rounded-xl bg-[var(--color-accent-error)]/10 border border-[var(--color-accent-error)]/25 px-4 py-2.5 text-sm font-medium text-[var(--color-accent-error)] transition-all duration-300 hover:bg-[var(--color-accent-error)]/15"
            >
              {t('chat.feedback_submit')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
