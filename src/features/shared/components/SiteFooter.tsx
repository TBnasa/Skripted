'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';

const APP_PATHS = ['/chat', '/dashboard', '/academy'];

export default function SiteFooter() {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (APP_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <footer className="relative border-t-2 border-[var(--color-border-active)] bg-[var(--color-bg-secondary)]">
      <div className="absolute inset-0 blueprint-grid opacity-20" />

      {/* revision strip */}
      <div className="relative z-10 border-b border-[var(--color-border)] px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between py-2.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
            Rev: 2.1 · Build 0417
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] sm:block">
            Drawn: 2026 · Sheet: Site
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">All Systems Online</span>
          </span>
        </div>
      </div>

      {/* title block grid */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-12 md:gap-6">
        {/* project info */}
        <div className="md:col-span-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-primary)] ink-shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-[var(--color-text-primary)]">Skripted</span>
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Script Forge · v2.1</span>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">
            AI destekli Minecraft Skript oluşturucu, bulut depolama ve topluluk galerisi — tek çizim masasında.
          </p>
        </div>

        {/* nav */}
        <div className="md:col-span-3">
          <span className="mono-label block">Navigation</span>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]">{t('general.home', { defaultValue: 'Home' })}</Link></li>
            <li><Link href="/gallery" className="text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]">{t('gallery.title_main')}</Link></li>
            <li><Link href="/pricing" className="text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]">{t('pricing.title')}</Link></li>
            <li><Link href="/support" className="text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]">{t('general.support')}</Link></li>
            <li><Link href="/chat" className="text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-accent-primary)]">{t('general.launch_engine')}</Link></li>
          </ul>
        </div>

        {/* spec block */}
        <div className="md:col-span-4">
          <span className="mono-label block">Specification</span>
          <ul className="mt-4 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            <li className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2">
              <span>Engine</span><span className="text-[var(--color-text-secondary)]">120B · Audit</span>
            </li>
            <li className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2">
              <span>Storage</span><span className="text-[var(--color-text-secondary)]">Cloud Sync</span>
            </li>
            <li className="flex items-center justify-between border-b border-dashed border-[var(--color-border)] pb-2">
              <span>Community</span><span className="text-[var(--color-text-secondary)]">Gallery</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Source</span>
              <a href="https://github.com/TBnasa/Skripted" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* legal bar */}
      <div className="relative z-10 border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            © 2026 Skripted Engine · {t('status.legal_disclaimer')}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]">Drawn with intent</span>
        </div>
      </div>
    </footer>
  );
}
