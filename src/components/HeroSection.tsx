'use client';

import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'RAG-Powered Search',
    description: 'Retrieves proven, working Skript examples from a curated knowledge base before generating code.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Syntax-Aware Editor',
    description: 'Monaco Editor with custom Skript highlighting — events, effects, variables, all color-coded.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Safety Guardrails',
    description: 'Enforces performance best practices — no memory leaks, no dangerous commands, modern syntax only.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'One-Click Deploy',
    description: 'Download your generated script as a ready-to-use .sk file. Drag, drop, reload.',
  },
] as const;

export default function HeroSection() {
  return (
    <section className="gradient-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Floating orbs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[var(--color-accent-primary)]/5 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--color-accent-secondary)]/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[var(--color-accent-success)]/3 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-4 py-2 text-sm text-[var(--color-text-secondary)] backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-success)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-success)]" />
          </span>
          Powered by Qwen 3.6 + RAG Pipeline
        </div>

        {/* Heading */}
        <h1 className="animate-slide-up mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          <span className="text-[var(--color-text-primary)]">Write Skript.</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--color-accent-primary)] via-[var(--color-accent-secondary)] to-[var(--color-accent-success)] bg-clip-text text-transparent">
            Not Bugs.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-slide-up mx-auto mb-10 max-w-2xl text-lg text-[var(--color-text-secondary)] md:text-xl" style={{ animationDelay: '0.2s' }}>
          AI-powered Minecraft Skript generation backed by a curated knowledge base of proven, working examples. Stop guessing syntax — start shipping plugins.
        </p>

        {/* CTA */}
        <div className="animate-slide-up flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/chat"
            className="animate-pulse-glow rounded-2xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:brightness-110 hover:scale-105"
          >
            Start Generating →
          </Link>
          <a
            href="https://github.com/TBnasa/Skripted"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 px-8 py-4 text-lg font-semibold text-[var(--color-text-secondary)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)]"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Features grid */}
      <div className="relative z-10 mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className="glass-card animate-slide-up p-6 transition-all duration-300 hover:border-[var(--color-accent-primary)]/40 hover:-translate-y-1"
            style={{ animationDelay: `${0.6 + i * 0.15}s` }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-sm font-bold text-[var(--color-text-primary)]">
              {feature.title}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />
    </section>
  );
}
