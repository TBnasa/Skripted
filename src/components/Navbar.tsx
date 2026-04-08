'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

import AuthButton from './AuthButton';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-[var(--color-border)] bg-[var(--color-bg-primary)]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center border-4 border-[var(--color-border)] bg-[var(--color-accent-primary)] transition-transform duration-300 group-hover:scale-105 shadow-[2px_2px_0px_#000]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-[var(--color-text-primary)]" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '14px' }}>
            {APP_NAME} <span className="text-[var(--color-accent-primary)] drop-shadow-[2px_2px_0_#000]">Engine</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="https://github.com/TBnasa/Skripted"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-lg uppercase tracking-widest text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-primary)] hover:drop-shadow-[2px_2px_0_#000]"
          >
            GitHub
          </a>
          
          <AuthButton />

          <Link
            href="/chat"
            className="mc-btn bg-[var(--color-accent-primary)] px-4 py-2 text-lg font-bold uppercase tracking-widest text-black hover:bg-[var(--color-accent-success)] sm:px-5"
          >
            Launch Engine
          </Link>
        </div>
      </div>
    </nav>
  );
}
