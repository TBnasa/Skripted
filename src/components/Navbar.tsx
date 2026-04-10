'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

import { useTranslation } from '@/lib/useTranslation';
import AuthButton from './AuthButton';

export default function Navbar() {
  const { t } = useTranslation();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-bg-tertiary)] bg-[var(--color-bg-primary)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-bg-tertiary)] bg-[var(--color-accent-primary)] transition-all duration-300 group-hover:scale-110 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">
            {APP_NAME} <span className="text-[var(--color-accent-primary)]">Engine</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="https://github.com/TBnasa/Skripted"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent-primary)]"
          >
            GitHub
          </a>
          
          <AuthButton />

          <Link
            href="/chat"
            className="mc-btn bg-[var(--color-accent-primary)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-[var(--color-accent-secondary)] rounded-lg"
          >
            {t('launch_engine')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
