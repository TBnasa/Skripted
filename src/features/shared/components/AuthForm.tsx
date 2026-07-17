'use client';

import { SignIn } from '@clerk/nextjs';

export default function AuthForm() {
  return (
    <SignIn
      routing="path"
      path="/login"
      forceRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-transparent border-none shadow-none p-0 w-full',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          socialButtonsBlockButton: [
            'w-full flex items-center justify-center gap-3 px-4 py-3.5',
            'rounded-xl border border-white/[0.06] bg-white/[0.03]',
            'text-sm font-bold text-[var(--color-text-secondary)]',
            'hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white',
            'transition-all duration-200 active:scale-[0.98]',
          ].join(' '),
          socialButtonsBlockButtonText: 'text-sm font-bold',
          socialButtonsProviderIcon: 'w-5 h-5',
          dividerLine: 'bg-white/[0.06]',
          dividerText: [
            'text-[var(--color-text-muted)] text-xs font-bold',
            'uppercase tracking-widest px-4',
          ].join(' '),
          formFieldLabel: 'text-sm font-medium text-[var(--color-text-secondary)] mb-2',
          formFieldInput: [
            'w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)]',
            'rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)]',
            'focus:outline-none focus:border-[var(--color-accent-primary)]',
            'focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all',
          ].join(' '),
          formButtonPrimary: [
            'w-full py-3.5 rounded-xl bg-[var(--color-accent-primary)]',
            'hover:brightness-110 text-black font-bold text-sm',
            'transition-all active:scale-[0.98] shadow-[0_0_16px_rgba(0,224,158,0.15)]',
          ].join(' '),
          footerActionLink: [
            'text-[var(--color-accent-primary)] font-bold text-sm',
            'hover:brightness-110 transition-all',
          ].join(' '),
          identityPreviewEditButton: 'text-[var(--color-accent-primary)]',
          formResendCodeLink: 'text-[var(--color-accent-primary)] font-bold',
        },
        variables: {
          colorPrimary: 'var(--color-accent-primary)',
          colorBackground: 'var(--color-bg-secondary)',
          colorText: 'var(--color-text-primary)',
          colorTextSecondary: 'var(--color-text-secondary)',
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  );
}
