'use client';

import { useTranslation } from '@/lib/useTranslation';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export default function AuthButton() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-9 w-9 rounded-xl shimmer-bg" aria-label="Loading authentication" />;
  }

  return (
    <div className="flex items-center">
      {isSignedIn ? (
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-9 h-9 rounded-xl border border-white/[0.06] shadow-sm",
            }
          }}
        />
      ) : (
        <SignInButton mode="modal">
          <button 
            className="btn-premium btn-ghost text-[11px] px-4 py-2"
            aria-label="Sign in to your account"
          >
            {t('sign_in')}
          </button>
        </SignInButton>
      )}
    </div>
  );
}
