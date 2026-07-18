export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
        <p className="text-sm font-mono text-[var(--color-text-muted)] uppercase tracking-widest">{text}</p>
      </div>
    </div>
  );
}
