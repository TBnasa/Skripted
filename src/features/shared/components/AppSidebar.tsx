'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { useAuth, SignInButton, UserButton } from '@clerk/nextjs';
import {
  MessageSquare,
  ImageIcon,
  LayoutDashboard,
  Code2,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Settings,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const primaryNav = [
  { href: '/chat', labelKey: 'general.engine', icon: MessageSquare },
  { href: '/gallery', labelKey: 'gallery.title_main', icon: ImageIcon },
  { href: '/dashboard', labelKey: 'general.dashboard', icon: LayoutDashboard },
  { href: '/dashboard/scripts', labelKey: 'dashboard.cloud_scripts', icon: Code2 },
] as const;

const secondaryNav: Array<{
  href: string | null;
  labelKey: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: 'soon';
}> = [
  { href: '/pricing', labelKey: 'pricing.title', icon: Sparkles },
  { href: '/support', labelKey: 'general.support', icon: HelpCircle },
  { href: null, labelKey: 'general.academy', icon: GraduationCap, badge: 'soon' },
];

export default function AppSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === '/chat') return pathname === '/chat' || pathname.startsWith('/chat/');
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-3 z-[60] flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[240px] flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] transition-transform duration-300 ease-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center transition-colors group-hover:bg-[var(--color-accent-secondary)] ink-shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">Skripted</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6">
          <div className="space-y-1">
            {primaryNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={t(item.labelKey)}
                active={isActive(item.href)}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>

          <div className="my-4 border-t border-[var(--color-border)]" />

          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <NavItem
                key={item.labelKey}
                href={item.href}
                icon={item.icon}
                label={t(item.labelKey)}
                active={isActive(item.href)}
                badge={item.badge}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-[var(--color-border)] px-3 py-3 space-y-1">
          <NavItem
            href="/u/me"
            icon={Settings}
            label={t('general.settings')}
            active={pathname.startsWith('/u/')}
            onClick={() => setIsOpen(false)}
          />

          <div className="flex items-center gap-3 px-3 py-2.5">
            {isLoaded && isSignedIn ? (
              <>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-xl border border-[var(--color-border)] shadow-sm",
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">Account</p>
                </div>
              </>
            ) : isLoaded ? (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                  <User size={16} />
                  <span>{t('sign_in')}</span>
                </button>
              </SignInButton>
            ) : (
              <div className="w-8 h-8 rounded-xl shimmer-bg" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  href: string | null;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  badge?: 'soon';
  onClick?: () => void;
}) {
  const isDisabled = !href;
  const className = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 relative ${
    isDisabled
      ? 'text-[var(--color-text-muted)]/40 cursor-not-allowed'
      : active
      ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-glow)] border border-[var(--color-border-active)]'
      : 'text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)]'
  }`;

  const content = (
    <>
      <span className="flex-shrink-0">
        <Icon size={16} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge === 'soon' && (
        <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-border-active)] rounded">
          Soon
        </span>
      )}
    </>
  );

  if (isDisabled) {
    return (
      <div className={className} title="Coming soon">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {content}
    </Link>
  );
}
