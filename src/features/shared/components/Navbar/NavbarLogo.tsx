'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarLogoProps {
  isChatPage: boolean;
}

export function NavbarLogo({ isChatPage }: NavbarLogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
        Skripted{isChatPage && <span className="text-emerald-400 ml-1">Engine</span>}
      </span>
    </Link>
  );
}
