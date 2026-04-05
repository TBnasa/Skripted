'use client';

interface DownloadButtonProps {
  readonly code: string;
  readonly filename?: string;
}

export default function DownloadButton({ code, filename = 'script.sk' }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!code.trim()) return;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!code.trim()}
      className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-success)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-accent-success)] transition-all duration-200 hover:bg-[var(--color-accent-success)]/25 disabled:cursor-not-allowed disabled:opacity-40"
      title="Download as .sk file"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download .sk
    </button>
  );
}
