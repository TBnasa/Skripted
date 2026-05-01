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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo Section */}
        <NavbarLogo isChatPage={isChatPage} />

        {/* Desktop Actions & Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <NavbarLanguageSwitcher 
            lang={lang} 
            switchLanguage={switchLanguage} 
          />

          <NavbarDesktopLinks 
            pathname={pathname} 
            t={t} 
          />

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <AuthButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <NavbarMobileMenu 
        isOpen={isMenuOpen} 
        setIsOpen={setIsMenuOpen} 
        pathname={pathname} 
        t={t} 
      />
    </nav>
  );
}
