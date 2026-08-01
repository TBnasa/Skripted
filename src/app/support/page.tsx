'use client';

import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/Button';
import { useTranslation } from '@/lib/useTranslation';

type Status = 'idle' | 'loading' | 'success' | 'error';

const contactDetails = [
  { icon: Mail, label: 'Email', value: 'hello@skripted.dev', href: 'mailto:hello@skripted.dev' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: MapPin, label: 'Address', value: '123 Developer Lane\nSan Francisco, CA 94102', href: '#' },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 2:00 PM', href: '#' },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
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
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to send message.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  return (
    <main className="relative min-h-screen bg-[var(--color-bg-primary)] pt-32 pb-20 px-6">
      <div className="absolute inset-0 line-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full px-4 py-1.5 text-xs text-[var(--color-accent-primary)] font-medium mb-6 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]" />
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
            Have a question, feedback, or need help? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-8 ink-shadow-sm h-full">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-[var(--color-accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Message Sent!</h2>
                  <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-sm mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
              <Button
                onClick={() => {
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                variant="secondary"
                className="w-full py-3.5"
              >
                <Send size={16} />
                {t('support.send_another')}
              </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us more about your question or issue..."
                      className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-hover)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition-all resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      <p className="text-sm text-[var(--color-accent-error)]">{errorMsg}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    variant="primary"
                    className="w-full py-3.5 text-sm active:scale-[0.98]"
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
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {contactDetails.map((detail) => (
              <a
                key={detail.label}
                href={detail.href}
                className="block group p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 flex items-center justify-center text-[var(--color-accent-primary)] shrink-0 group-hover:bg-[var(--color-accent-primary)]/15 transition-colors">
                    <detail.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                      {detail.label}
                    </p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] whitespace-pre-line">
                      {detail.value}
                    </p>
                  </div>
                </div>
              </a>
            ))}

            <div className="p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                Follow Us
              </p>
              <div className="flex gap-3">
                <a
                  href="https://github.com/TBnasa/Skripted"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)] hover:border-[var(--color-border-hover)] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-glow)] hover:border-[var(--color-border-hover)] transition-all"
                >
                  <MessageCircle size={16} />
                  Discord
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[var(--color-border)] text-center">
          <p className="text-[var(--color-text-muted)] text-xs max-w-xl mx-auto leading-relaxed">
            We typically respond within 24 hours. For urgent issues, reach us on Discord.
          </p>
        </div>
      </div>
    </main>
  );
}
