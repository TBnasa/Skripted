'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import AuthButton from './AuthButton';
import { Sparkles, Menu, X, LayoutDashboard, Image as ImageIcon, Code2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const translation = useTranslation();
  const t = translation?.t || ((key: string) => key);
  const lang = translation?.lang || 'en';
  const switchLanguage = translation?.switchLanguage || (() => {});
  const pathname = usePathname();
  const isChatPage = pathname === '/chat' || pathname.startsWith('/chat/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
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

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 mr-2">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                lang === 'en' || lang.startsWith('en') ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('tr')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                lang === 'tr' || lang.startsWith('tr') ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              TR
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/TBnasa/Skripted"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] transition-all duration-300 hover:text-[var(--color-text-primary)] rounded-lg hover:bg-white/[0.03]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>

            <Link
              href="/pricing"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition-all duration-300 hover:text-emerald-400 rounded-lg whitespace-nowrap relative group"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('pricing.title')}
              <span className="ml-1 px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase tracking-tighter">
                New
              </span>
            </Link>

            <Link
              href="/support"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] transition-all duration-300 hover:text-emerald-400 rounded-lg whitespace-nowrap"
            >
              {t('general.support')}
            </Link>

            <div
              className="group relative flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 cursor-not-allowed transition-all duration-300 rounded-lg"
              title={t('general.academy_tooltip')}
            >
              <Code2 className="w-3.5 h-3.5" />
              {t('general.academy')}
              <span className="px-1.5 py-0.5 text-[8px] font-black bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-400 border border-purple-500/30 rounded uppercase tracking-tighter">
                {t('general.soon')}
              </span>
            </div>

            {pathname !== '/chat' && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5 hover:border-white/10"
                >
                  {t('general.dashboard')}
                </Link>
                <Link
                  href="/chat"
                  className="btn-premium btn-primary text-[11px]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  {t('general.launch_engine')}
                </Link>
              </>
            )}
            
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <AuthButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-white/5 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              <Link
                href="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-white hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {t('pricing.title')}
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-black rounded font-black uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  New
                </span>
              </Link>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <MobileNavLink
                  href="/gallery"
                  onClick={() => setIsMenuOpen(false)}
                  icon={<ImageIcon className="w-4 h-4" />}
                  label={t('gallery.title_main')}
                />
                <MobileNavLink
                  href="/dashboard/scripts"
                  onClick={() => setIsMenuOpen(false)}
                  icon={<Code2 className="w-4 h-4" />}
                  label={t('dashboard.cloud_scripts')}
                />
                <MobileNavLink
                  href="/support"
                  onClick={() => setIsMenuOpen(false)}
                  icon={<Sparkles className="w-4 h-4" />}
                  label={t('general.support')}
                />
              </div>

              {pathname !== '/chat' && (
                <div className="flex flex-col gap-2">
                  <div
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-zinc-500 cursor-not-allowed opacity-60"
                  >
                    <Code2 className="w-4 h-4" />
                    {t('general.academy')} 🎓
                    <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                      {t('general.soon')}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-white active:bg-white/10"
                  >
                    <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                      <LayoutDashboard className="w-3 h-3 text-emerald-400" />
                    </div>
                    {t('general.dashboard')}
                  </Link>
                  <Link
                    href="/chat"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500 text-black text-sm font-black transition-transform active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
                className="mt-4 flex items-center justify-center gap-3 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-zinc-500 bg-white/[0.02] border border-white/5 hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub Project
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ href, onClick, icon, label }: { href: string, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-bold text-zinc-400 active:bg-emerald-500/10 active:border-emerald-500/30 active:text-emerald-400 transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-active:bg-emerald-500/20">
        {icon}
      </div>
      {label}
    </Link>
  );
}
