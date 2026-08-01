'use client';

import Link from 'next/link';
import { Code2 } from 'lucide-react';
import AuthButton from '../AuthButton';
import { Button } from '@/features/shared/components/ui/Button';

interface NavbarDesktopLinksProps {
  pathname: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

function Tab({
  href,
  label,
  active,
  disabled,
}: {
  href: string;
  label: string;
  active: boolean;
  disabled?: boolean;
}) {
  const base =
    'px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 border-b-2 whitespace-nowrap';
  if (disabled) {
    return (
      <span
        className={`${base} cursor-not-allowed border-transparent text-[var(--color-text-muted)]/50`}
        title="Coming soon"
      >
        {label} <span className="text-[9px] italic normal-case tracking-normal">(soon)</span>
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${
        active
          ? 'border-[var(--color-accent-primary)] text-[var(--color-text-primary)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-border-active)]'
      }`}
    >
      {label}
    </Link>
  );
}

export function NavbarDesktopLinks({ pathname, t }: NavbarDesktopLinksProps) {
  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="flex items-center gap-1 mr-2">
        <Tab href="/" label={t('general.home')} active={isActive(pathname, '/')} />
        <Tab href="/gallery" label={t('gallery.title_main')} active={isActive(pathname, '/gallery')} />
        <Tab href="/dashboard" label={t('general.dashboard')} active={isActive(pathname, '/dashboard')} />
        <Tab href="/pricing" label={t('pricing.title')} active={isActive(pathname, '/pricing')} />
        <Tab href="/support" label={t('general.support')} active={isActive(pathname, '/support')} />
        <Tab href="#" label={t('general.academy')} disabled />
      </div>

      <div className="h-5 w-px bg-[var(--color-border)]" />

      <a
        href="https://github.com/TBnasa/Skripted"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className="p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:text-[var(--color-accent-primary)] rounded-lg hover:bg-[var(--color-accent-glow)]"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>

      {!pathname.startsWith('/dashboard') && pathname !== '/chat' && (
        <Button as="a" href="/chat" variant="primary" size="sm" className="text-[11px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          {t('general.launch_engine')}
        </Button>
      )}
      <AuthButton />
    </div>
  );
}
