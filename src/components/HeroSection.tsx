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
          Build <span className="text-[var(--color-accent-primary)]">Better</span> <br />
          Minecraft Scripts.
        </h1>

        {/* Description */}
        <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)] sm:text-2xl">
          An elite cloud-based script IDE powered by Deep Context Engine. Generate, analyze, and optimize Skript code with Universal Compatibility.
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

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {[
            { title: 'Deep Context Engine', desc: t('tr') === 'tr' ? '250+ seçkin mimari örnekle beslenen derin bağlam motoru.' : 'Expert context engine trained on 250+ elite architectural patterns.' },
            { title: 'Live Logic Guard', desc: t('tr') === 'tr' ? 'Siz yazarken hataları yakalayan canlı mantık koruması.' : 'Real-time logic guard detecting errors as you type.' },
            { title: 'Universal Compatibility', desc: t('tr') === 'tr' ? 'Tüm Minecraft sürümleri ve Skript addonları ile tam uyum.' : 'Full compatibility with all Minecraft versions and Skript addons.' },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] transition-all hover:border-[var(--color-accent-primary)]/50 group">
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
