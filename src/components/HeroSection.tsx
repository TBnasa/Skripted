'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] px-6 pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 dot-grid opacity-40" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px] animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Version Badge */}
        <div className="animate-fade-in mx-auto mb-10 flex w-fit items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium tracking-wider text-[var(--color-text-secondary)]">
            Skripted Engine v2.1.0-beta
          </span>
        </div>

        {/* Main Title */}
        <h1 className="animate-slide-up mb-8 text-5xl font-extrabold text-white sm:text-6xl md:text-7xl tracking-tight leading-[1.05]">
          Daha İyi{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Minecraft
          </span>
          <br />
          Scriptleri Yazın.
        </h1>

        {/* Description */}
        <p className="animate-fade-in mx-auto mb-14 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)]" style={{ animationDelay: '0.2s' }}>
          {t('hero_desc')}
        </p>

        {/* Actions */}
        <div className="animate-fade-in flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/chat"
            className="btn-premium btn-primary group relative px-10 py-4 text-sm font-bold"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              {t('access_engine')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 gap-5 text-left sm:grid-cols-3 stagger-children">
          {[
            { title: t('feature1_title'), desc: t('feature1_desc'), icon: '🧠' },
            { title: t('feature2_title'), desc: t('feature2_desc'), icon: '🛡️' },
            { title: t('feature3_title'), desc: t('feature3_desc'), icon: '⚡' },
          ].map((feature, i) => (
            <div key={i} className="animate-fade-in-scale glass-card p-7 group cursor-default">
              <div className="text-2xl mb-4">{feature.icon}</div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400 group-hover:text-emerald-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-32 pb-12 opacity-30 hover:opacity-60 transition-opacity duration-500">
          <p className="text-[10px] font-medium tracking-[0.15em] text-[var(--color-text-muted)] uppercase">
            {t('legal_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
