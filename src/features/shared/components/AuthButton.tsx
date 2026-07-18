'use client';

import { useTranslation } from '@/lib/useTranslation';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { User } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/Button';

export default function AuthButton() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-9 w-9 rounded-xl shimmer-bg" aria-label="Loading authentication" />;
  }

  return (
    <div className="flex items-center gap-3">
      {isSignedIn ? (
        <>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-xl border border-[var(--color-border)] shadow-sm",
              }
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label={t('user_profile')}
                labelIcon={<User size={14} />}
                href={`/u/me`}
              />
            </UserButton.MenuItems>
          </UserButton>
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm" className="text-[11px]" aria-label="Sign in to your account">
            {t('sign_in')}
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
