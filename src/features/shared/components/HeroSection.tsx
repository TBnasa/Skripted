'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { Brain, Shield, Zap, GraduationCap } from 'lucide-react';

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] px-6 pt-16">
      {/* Background — Subtle line grid, no dot-grid/mesh-gradient/orbs */}
      <div className="absolute inset-0 line-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Version Badge — Clean, no pulse */}
        <div className="animate-fade-in mx-auto mb-10 flex w-fit items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
          </span>
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-secondary)]">
            Skripted Engine v2.1.0-beta
          </span>
        </div>

        {/* Main Title — Bold, no gradient text */}
        <h1 className="animate-slide-up mb-8 text-4xl font-black text-white sm:text-7xl md:text-8xl tracking-tighter leading-[0.92] text-balance">
          {t('hero.title_1')} <br />
          <span className="text-[var(--color-accent-primary)]">
            {t('hero.title_2')}
          </span>
        </h1>

        {/* Description */}
        <p className="animate-fade-in mx-auto mb-14 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] font-medium" style={{ animationDelay: '0.15s' }}>
          {t('hero.desc')}
        </p>

        {/* Actions — Compact, decisive */}
        <div className="animate-fade-in flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4" style={{ animationDelay: '0.25s' }}>
          <Link
            href="/chat"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-bold text-sm text-[var(--color-bg-primary)] transition-all duration-250 bg-[var(--color-accent-primary)] rounded-xl hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            <span className="flex items-center gap-2.5">
              {t('general.access_engine')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>

          <div
            className="group w-full sm:w-auto px-8 py-4 text-sm font-semibold text-[var(--color-text-muted)] transition-all border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)] cursor-not-allowed text-center flex items-center justify-center gap-3 relative"
            title={t('general.academy_tooltip')}
          >
            <GraduationCap className="w-4 h-4" />
            {t('hero.start_learning')}
            <span className="text-[10px] italic text-[var(--color-text-muted)]">
              ({t('general.soon')})
            </span>
          </div>

          <Link
            href="/gallery"
            className="group w-full sm:w-auto px-8 py-4 text-sm font-semibold text-[var(--color-text-secondary)] transition-all border border-[var(--color-border)] rounded-xl hover:text-white hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-secondary)] text-center"
          >
            {t('hero.explore_gallery')}
          </Link>
        </div>

        {/* Feature Bento Grid — Asymmetric, editorial */}
        <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {[
            { 
              title: t('features.feature1_title'), 
              desc: t('features.feature1_desc'), 
              icon: <Brain className="w-5 h-5" />,
              accent: 'var(--color-accent-primary)'
            },
            { 
              title: t('features.feature2_title'), 
              desc: t('features.feature2_desc'), 
              icon: <Shield className="w-5 h-5" />,
              accent: '#5b9aff'
            },
            { 
              title: t('features.feature3_title'), 
              desc: t('features.feature3_desc'), 
              icon: <Zap className="w-5 h-5" />,
              accent: 'var(--color-accent-warm)'
            },
            { 
              title: t('features.feature4_title'), 
              desc: t('features.feature4_desc'), 
              icon: <GraduationCap className="w-5 h-5" />,
              accent: '#a78bfa'
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="animate-fade-in-scale group p-7 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div 
                className="mb-5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${feature.accent} 10%, transparent)`,
                  color: feature.accent,
                  border: `1px solid color-mix(in srgb, ${feature.accent} 20%, transparent)`
                }}
              >
                {feature.icon}
              </div>
              <h3 className="mb-3 text-sm font-bold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-28 pb-12 opacity-25 hover:opacity-50 transition-opacity duration-500">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)]">
            {t('status.legal_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
