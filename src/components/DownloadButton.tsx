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
      className="mc-btn flex items-center gap-2 bg-[var(--color-accent-success)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
      title="Download as .sk file"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download .sk
    </button>
  );
}
