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
            'hover:bg-white/[0.06] hover:border-white/[0.12]',
            'transition-all duration-200 active:scale-[0.98]',
          ].join(' '),
          socialButtonsBlockButtonText: 'text-sm font-bold !text-white',
          socialButtonsProviderIcon: 'w-5 h-5',

          dividerLine: '!bg-white/[0.06]',
          dividerText: '!text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest px-4',

          formFieldLabel: '!text-[var(--color-text-secondary)] text-sm font-medium mb-2',
          formFieldInput: [
            'w-full !bg-[var(--color-bg-primary)] !border !border-[var(--color-border-hover)]',
            '!rounded-xl !px-4 !py-3 text-sm !text-white',
            'placeholder:!text-[var(--color-text-muted)]',
            'focus:outline-none focus:!border-[var(--color-accent-primary)]',
            'focus:!ring-1 focus:!ring-[var(--color-accent-primary)]/30 transition-all',
          ].join(' '),
          formFieldInputShowPasswordButton: '!text-[var(--color-text-muted)] hover:!text-white',

          formButtonPrimary: [
            'w-full !py-3.5 !rounded-xl !bg-[var(--color-accent-primary)]',
            'hover:brightness-110 !text-black !font-bold text-sm',
            'transition-all active:scale-[0.98]',
            '!shadow-[0_0_16px_rgba(0,224,158,0.15)]',
          ].join(' '),
          formButtonReset: '!text-[var(--color-accent-primary)] !font-bold text-sm',

          footerAction: 'mt-4',
          footerActionLink: '!text-[var(--color-accent-primary)] !font-bold text-sm hover:brightness-110 transition-all',

          identityPreview: '!bg-white/[0.03] !border !border-white/[0.06] !rounded-xl',
          identityPreviewEditButton: '!text-[var(--color-accent-primary)]',
          identityPreviewEditButtonIcon: '!text-[var(--color-accent-primary)]',

          formResendCodeLink: '!text-[var(--color-accent-primary)] !font-bold',

          OTPCodeFieldInput: '!bg-[var(--color-bg-primary)] !border !border-[var(--color-border-hover)] !rounded-xl !text-white',

          alertText: '!text-[var(--color-text-secondary)]',
          alertIcon: '!text-[var(--color-accent-primary)]',

          formHeaderTitle: '!text-[var(--color-text-primary)]',
          formHeaderSubtitle: '!text-[var(--color-text-muted)]',

          verificationLinkText: '!text-[var(--color-accent-primary)] !font-bold',

          modalCloseButton: '!text-[var(--color-text-muted)] hover:!text-white',

          scrollBox: 'bg-[var(--color-bg-secondary)]',

          logoImage: 'w-10 h-10',
          logoText: '!text-[var(--color-text-primary)]',
        },
        variables: {
          colorPrimary: 'var(--color-accent-primary)',
          colorBackground: 'var(--color-bg-secondary)',
          colorText: '#ffffff',
          colorTextSecondary: 'var(--color-text-secondary)',
          colorInputText: '#ffffff',
          colorTextOnPrimaryBackground: '#000000',
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
        },
      }}
    />
  );
}
