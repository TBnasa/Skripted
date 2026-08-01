'use client';

import Link from 'next/link';

interface NavbarLogoProps {
  isChatPage: boolean;
}

export function NavbarLogo({ isChatPage }: NavbarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center transition-colors duration-300 group-hover:bg-[var(--color-accent-secondary)] ink-shadow-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
          Skripted{isChatPage && <span className="text-[var(--color-accent-primary)] font-mono text-sm tracking-tighter">_engine</span>}
        </span>
        <span className="mt-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
          Script Forge · v2.1
        </span>
      </span>
    </Link>
  );
}
