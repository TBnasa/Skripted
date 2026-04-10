'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-10 w-24 animate-pulse border-4 border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[2px_2px_0_#000]" />
    );
  }

  return user ? (
    <div className="flex items-center gap-4 group">
      <div className="flex items-center gap-2 group-hover:opacity-90 transition-opacity cursor-pointer">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] shadow-sm">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
        <div className="hidden flex-col items-start gap-0.5 sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
            {t('user_profile')}
          </span>
          <span className="text-[9px] font-medium text-[var(--color-text-muted)] truncate max-w-[100px]">
            {user.email?.split('@')[0]}
          </span>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="mc-btn px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] transition-all border border-[var(--color-bg-tertiary)]"
      >
        {t('sign_out')}
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="mc-btn bg-[var(--color-bg-secondary)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-accent-primary)] hover:text-black border border-[var(--color-bg-tertiary)]"
    >
      {t('sign_in')}
    </Link>
  );
}
