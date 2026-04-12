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
        <h1 className="animate-slide-up mb-8 text-5xl font-black text-white sm:text-7xl md:text-8xl tracking-tight leading-[0.95]">
          {t('hero_title_1')} <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            {t('hero_title_2')}
          </span>
        </h1>

        {/* Description */}
        <p className="animate-fade-in mx-auto mb-14 max-w-2xl text-xl leading-relaxed text-zinc-400 font-medium" style={{ animationDelay: '0.2s' }}>
          {t('hero_desc')}
        </p>

        {/* Actions */}
        <div className="animate-fade-in flex flex-col items-center justify-center gap-6 sm:flex-row" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/chat"
            className="group relative inline-flex items-center justify-center px-12 py-5 font-black text-black transition-all duration-300 bg-emerald-500 rounded-2xl hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95"
          >
            <span className="flex items-center gap-3">
              {t('access_engine')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:translate-x-1.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>

          <Link
            href="/gallery"
            className="group px-10 py-5 text-sm font-bold text-white transition-all border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/20"
          >
            {t('explore_gallery')}
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {[
            { 
              title: t('feature1_title'), 
              desc: t('feature1_desc'), 
              icon: <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">🧠</div> 
            },
            { 
              title: t('feature2_title'), 
              desc: t('feature2_desc'), 
              icon: <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)]">🛡️</div> 
            },
            { 
              title: t('feature3_title'), 
              desc: t('feature3_desc'), 
              icon: <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">⚡</div> 
            },
          ].map((feature, i) => (
            <div key={i} className="animate-fade-in-scale p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-md group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-2">
              <div className="mb-6 group-hover:scale-110 transition-transform duration-500 w-fit">{feature.icon}</div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-300 transition-colors">
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
