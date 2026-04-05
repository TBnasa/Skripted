'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
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
      <div className="h-9 w-20 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
    );
  }

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[var(--color-text-secondary)] hidden sm:block">
        {user.email?.split('@')[0]}
      </span>
      <button
        onClick={handleSignOut}
        className="rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent-primary)]/50"
    >
      Sign In
    </Link>
  );
}
