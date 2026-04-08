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
      <div className="h-10 w-24 animate-pulse border-4 border-[var(--color-border)] bg-[var(--color-bg-tertiary)] shadow-[2px_2px_0_#000]" />
    );
  }

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-lg font-bold text-[var(--color-text-secondary)] hidden sm:block uppercase tracking-widest">
        {user.email?.split('@')[0]}
      </span>
      <button
        onClick={handleSignOut}
        className="mc-btn px-4 py-2 text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] transition-colors"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="mc-btn bg-[var(--color-bg-secondary)] px-4 py-2 text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent-primary)]"
    >
      Sign In
    </Link>
  );
}
