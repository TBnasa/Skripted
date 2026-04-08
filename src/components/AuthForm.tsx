'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { APP_URL } from '@/lib/constants';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage('✅ Check your email for the login link!');
    }
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={handleGitHubLogin}
        className="mc-btn flex w-full items-center justify-center gap-3 bg-[#24292F] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#24292F]/90"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        Continue with GitHub
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t-4 border-[var(--color-border)]"></div>
        <span className="shrink-0 px-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]" style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '10px' }}>
          Or use email
        </span>
        <div className="flex-grow border-t-4 border-[var(--color-border)]"></div>
      </div>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-5">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full border-4 border-[var(--color-border)] bg-[#111] px-4 py-3 text-lg font-mono text-[var(--color-accent-primary)] placeholder:text-[var(--color-text-muted)] shadow-[inset_4px_4px_0_rgba(0,0,0,0.5)] focus:border-[var(--color-accent-primary)] focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mc-btn w-full bg-[var(--color-accent-primary)] px-4 py-3 text-lg font-bold uppercase tracking-widest text-black transition-all hover:bg-[var(--color-accent-success)] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
        >
          {loading ? 'Sending link...' : 'Send Magic Link'}
        </button>
      </form>

      {message && (
        <p className="mt-2 border-4 border-black bg-[var(--color-bg-secondary)] p-3 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] shadow-[4px_4px_0_#000]">
          {message}
        </p>
      )}
    </div>
  );
}
