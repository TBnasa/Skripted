'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

// Sub-components
import { NavbarLogo } from './Navbar/NavbarLogo';
import { NavbarLanguageSwitcher } from './Navbar/NavbarLanguageSwitcher';
import { NavbarDesktopLinks } from './Navbar/NavbarDesktopLinks';
import { NavbarMobileMenu } from './Navbar/NavbarMobileMenu';
import AuthButton from './AuthButton';

/**
 * Global Navigation Bar Orchestrator
 */
export default function Navbar() {
  const { t, lang, switchLanguage } = useTranslation();
  const pathname = usePathname();
  const isChatPage = pathname === '/chat' || pathname.startsWith('/chat/');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/85 backdrop-blur-2xl">
      {/* Tier 0 — engineering spec strip (md+) */}
      <div className="hidden h-5 items-center justify-between border-b border-[var(--color-border)] px-6 md:flex">
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-[var(--color-accent-primary)]" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            Project: Skripted_Engine
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            Rev 2.1 · Build 0417
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-secondary)]">
              Online
            </span>
          </span>
        </div>
      </div>

      {/* Tier 1 — main bar (44px; total 64px = pt-16 pages) */}
      <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-6">
        {!isDashboardPage && <NavbarLogo isChatPage={isChatPage} />}
        {isDashboardPage && <div />}

        <div className="flex items-center gap-2 sm:gap-4">
          <NavbarLanguageSwitcher 
            lang={lang} 
            switchLanguage={switchLanguage} 
          />

          <NavbarDesktopLinks 
            pathname={pathname} 
            t={t} 
          />

          {!isDashboardPage && (
            <div className="flex md:hidden items-center gap-2">
              <AuthButton />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <NavbarMobileMenu 
        isOpen={isMenuOpen} 
        setIsOpen={setIsMenuOpen} 
        pathname={pathname} 
        t={t} 
      />
    </nav>
  );
}
