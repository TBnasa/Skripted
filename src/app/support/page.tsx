'use client';

import { useState, FormEvent } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SupportPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to send message.');
      }

      setStatus('success');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full px-4 py-1.5 text-xs text-[var(--color-accent-primary)] font-medium mb-6 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
            Support
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            How can we help?
          </h1>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
            Send us a message and our team will reply directly to your email.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Message Sent!</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-6">
                We received your message and will reply to your email shortly.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="px-5 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-hover)] text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-text-muted)] transition-all"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="support-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Your Email
                </label>
                <input
                  id="support-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="support-message" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Message
                </label>
                <textarea
                  id="support-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all resize-none"
                />
              </div>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="text-sm text-red-300">{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl bg-[var(--color-accent-primary)] hover:brightness-110 text-black font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-[var(--color-text-muted)] text-xs mt-6">
          Replies are sent to your email within 24 hours.
        </p>
      </div>
    </main>
  );
}
