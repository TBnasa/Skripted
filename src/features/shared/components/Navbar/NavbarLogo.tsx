'use client';

import Link from 'next/link';

interface NavbarLogoProps {
  isChatPage: boolean;
}

export function NavbarLogo({ isChatPage }: NavbarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-lg border border-[var(--color-accent-primary)]/40 flex items-center justify-center transition-colors duration-300 group-hover:border-[var(--color-accent-primary)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
        Skripted{isChatPage && <span className="text-[var(--color-text-secondary)] ml-1">Engine</span>}
      </span>
    </Link>
  );
}
