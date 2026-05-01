'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  readonly code: string;
  readonly filename?: string;
}

export default function DownloadButton({ code, filename = 'script.sk' }: DownloadButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

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

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!code.trim()}
      aria-label="Download script as .sk file"
      className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-xl border transition-all duration-300 disabled:opacity-30 ${
        downloaded
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'bg-white/[0.03] border-white/[0.06] text-[var(--color-text-secondary)] hover:bg-white/[0.06] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {downloaded ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Downloaded!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download .sk
        </>
      )}
    </button>
  );
}
