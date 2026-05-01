'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Code2 } from 'lucide-react';
import AuthButton from '../AuthButton';

interface NavbarDesktopLinksProps {
  pathname: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function NavbarDesktopLinks({ pathname, t }: NavbarDesktopLinksProps) {
  return (
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
  );
}
