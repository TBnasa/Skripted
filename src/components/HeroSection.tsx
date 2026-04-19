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
      
      {/* Animated Glow Orbs (GPU Accelerated) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px] animate-float transition-transform transform-gpu" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px] animate-float transition-transform transform-gpu hidden md:block" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Version Badge */}
        <div className="animate-fade-in mx-auto mb-10 flex w-fit items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-1.5 backdrop-blur-md">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Skripted Engine <span className="text-zinc-600">v2.1.0-beta</span>
          </span>
        </div>

        {/* Main Title */}
        <h1 className="animate-slide-up mb-8 text-5xl font-extrabold text-white sm:text-7xl md:text-8xl tracking-tight leading-[0.95]">
          {t('hero.title_1')} <br />
          <span className="premium-gradient-text">
            {t('hero.title_2')}
          </span>
        </h1>

        {/* Description */}
        <p className="animate-fade-in mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-zinc-500 font-medium" style={{ animationDelay: '0.2s' }}>
          {t('hero.desc')}
        </p>

        {/* Actions */}
        <div className="animate-fade-in flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/chat"
            className="launch-engine-btn group w-full sm:w-auto inline-flex items-center justify-center px-10 py-4.5 text-sm active:scale-95"
          >
            <span className="flex items-center gap-2.5">
              {t('general.access_engine')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>

          <Link
            href="/academy"
            className="start-learning-btn group w-full sm:w-auto px-10 py-4.5 text-sm font-bold text-center flex items-center justify-center gap-2.5"
          >
            {t('hero.start_learning')}
          </Link>

          <Link
            href="/gallery"
            className="explore-gallery-btn group w-full sm:w-auto px-8 py-4.5 text-sm font-bold text-center"
          >
            {t('hero.explore_gallery')}
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: t('features.feature1_title'), 
              desc: t('features.feature1_desc'), 
              icon: <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl">🧠</div> 
            },
            { 
              title: t('features.feature2_title'), 
              desc: t('features.feature2_desc'), 
              icon: <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl">🛡️</div> 
            },
            { 
              title: t('features.feature3_title'), 
              desc: t('features.feature3_desc'), 
              icon: <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl">⚡</div> 
            },
            { 
              title: t('features.feature4_title'), 
              desc: t('features.feature4_desc'), 
              icon: <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xl">🎓</div> 
            },
          ].map((feature, i) => (
            <div key={i} className="animate-fade-in p-8 rounded-3xl bg-white/[0.01] border border-white/[0.03] group hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-300">
              <div className="mb-6 w-fit">{feature.icon}</div>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 group-hover:text-zinc-400 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-32 pb-12 opacity-30 hover:opacity-60 transition-opacity duration-500">
          <p className="text-[10px] font-medium tracking-[0.15em] text-[var(--color-text-muted)] uppercase">
            {t('status.legal_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
