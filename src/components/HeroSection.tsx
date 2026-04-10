'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden engine-bg px-6 pt-20">
      {/* Structural Elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent-glow),transparent_70%)] opacity-30" />
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Version Badge */}
        <div className="animate-fade-in mx-auto mb-8 flex w-fit items-center gap-2 border-4 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 backdrop-blur-md shadow-[4px_4px_0px_var(--color-border)]">
          <span className="flex h-3 w-3 bg-[var(--color-accent-primary)] animate-pulse border border-black" />
          <span className="text-sm font-mono font-medium tracking-wider text-[var(--color-text-secondary)] uppercase">
            Skripted Engine v2.1.0-beta
          </span>
        </div>

        {/* Main Title */}
        <h1 className="mb-6 text-4xl font-black text-[var(--color-text-primary)] sm:text-6xl md:text-7xl tracking-tight leading-[1.1]">
          Daha İyi <span className="text-[var(--color-accent-primary)]">Minecraft</span> <br />
          Scriptleri Yazın.
        </h1>

        {/* Description */}
        <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)] sm:text-2xl">
          {t('hero_desc')}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            href="/chat"
            className="mc-btn group relative flex h-14 w-full items-center justify-center gap-3 bg-[var(--color-accent-primary)] px-8 text-sm font-bold text-black sm:w-auto rounded-xl shadow-lg hover:shadow-var(--color-accent-glow)"
          >
            <span className="relative z-10 flex items-center gap-2 uppercase tracking-[0.2em]">
              {t('access_engine')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>

          <a
            href="https://github.com/TBnasa/Skripted"
            target="_blank"
            rel="noopener noreferrer"
            className="mc-btn flex h-14 w-full items-center justify-center gap-3 bg-[var(--color-bg-secondary)] px-8 text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-[0.2em] hover:bg-[var(--color-bg-tertiary)] sm:w-auto rounded-xl border border-[var(--color-bg-tertiary)]"
          >
            {t('view_architecture')}
          </a>
        </div>

        {/* Trusted By Leaders */}
        <div className="mt-20 pt-10 border-t border-[var(--color-border)] opacity-80">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-8">
            Sektör Liderleri Tarafından Güveniliyor
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-accent-primary)]"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="font-bold text-lg tracking-wide font-sans text-white">SwiftCode API</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-accent-gold)]"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 8v8"/></svg>
              <span className="font-bold text-lg tracking-wide font-sans text-white">Vely's Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-accent-secondary)]"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span className="font-bold text-lg tracking-wide font-sans text-white">MineArchitect</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {[
            { title: t('feature1_title'), desc: t('feature1_desc') },
            { title: t('feature2_title'), desc: t('feature2_desc') },
            { title: t('feature3_title'), desc: t('feature3_desc') },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl glass-panel group">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] group-hover:scale-105 transition-transform origin-left">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer / Legal Disclaimer */}
        <div className="mt-32 pb-12 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
            {t('legal_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
