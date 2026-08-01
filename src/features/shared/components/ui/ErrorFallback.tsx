'use client';

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-[var(--color-text-primary)] mb-2">Something went wrong</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 font-mono">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
