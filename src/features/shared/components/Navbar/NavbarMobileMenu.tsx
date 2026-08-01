'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ImageIcon, Code2, LayoutDashboard } from 'lucide-react';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  pathname: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function NavbarMobileMenu({ isOpen, setIsOpen, pathname, t }: NavbarMobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex flex-col gap-2 p-6">
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] hover:border-[var(--color-border-active)] transition-all"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
                {t('pricing.title')}
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]"></span>
            </Link>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <MobileNavLink
                href="/gallery"
                onClick={() => setIsOpen(false)}
                icon={<ImageIcon className="w-4 h-4" />}
                label={t('gallery.title_main')}
              />
              <MobileNavLink
                href="/dashboard/scripts"
                onClick={() => setIsOpen(false)}
                icon={<Code2 className="w-4 h-4" />}
                label={t('dashboard.cloud_scripts')}
              />
              <MobileNavLink
                href="/support"
                onClick={() => setIsOpen(false)}
                icon={<Sparkles className="w-4 h-4" />}
                label={t('general.support')}
              />
            </div>

            {!pathname.startsWith('/dashboard') && pathname !== '/chat' && (
              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center justify-center gap-3 p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-muted)] cursor-not-allowed opacity-60"
                >
                  <Code2 className="w-4 h-4" />
                  {t('general.academy')}
                  <span className="text-[10px] italic text-[var(--color-text-muted)]">(soon)</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] active:bg-[var(--color-accent-glow)]"
                >
                  <div className="w-4 h-4 rounded bg-[var(--color-accent-glow)] flex items-center justify-center">
                    <LayoutDashboard className="w-3 h-3 text-[var(--color-accent-primary)]" />
                  </div>
                  {t('general.dashboard')}
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setIsOpen(false)}
                  className="btn-forge flex items-center justify-center gap-3 p-4 rounded-lg text-sm font-black transition-transform active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  {t('general.launch_engine')}
                </Link>
              </div>
            )}

            <a
              href="https://github.com/TBnasa/Skripted"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-3 p-4 rounded-lg text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:text-[var(--color-accent-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Project
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileNavLink({ href, onClick, icon, label }: { href: string, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] active:bg-[var(--color-accent-glow)] active:border-[var(--color-border-active)] active:text-[var(--color-accent-primary)] transition-all"
    >
      <div className="w-8 h-8 rounded bg-[var(--color-accent-glow)] flex items-center justify-center group-active:bg-[var(--color-accent-primary)]/15">
        {icon}
      </div>
      {label}
    </Link>
  );
}
