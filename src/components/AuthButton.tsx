'use client';

import { useTranslation } from '@/lib/useTranslation';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export default function AuthButton() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-10 w-24 animate-pulse border-4 border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[2px_2px_0_#000]" />;
  }

  return (
    <div className="flex items-center gap-4 group">
      {isSignedIn ? (
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10 border border-[var(--color-bg-tertiary)] shadow-sm",
            }
          }}
        />
      ) : (
        <SignInButton mode="modal">
          <button className="mc-btn bg-[var(--color-bg-secondary)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-accent-primary)] hover:text-black border border-[var(--color-bg-tertiary)]">
            {t('sign_in')}
          </button>
        </SignInButton>
      )}
    </div>
  );
}
