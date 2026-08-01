'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

export default function FooterCTA() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-primary)] px-6 pb-20 pt-12 md:pt-10">
      <div className="absolute inset-0 blueprint-grid opacity-40" />

      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="corner-ticks relative z-10 mx-auto max-w-4xl rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 text-center md:p-16 ink-shadow"
      >
        {/* eyebrow */}
        <div className="mono-label mb-5 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
          {t('footer.cta_eyebrow', { defaultValue: 'Ready' })}
        </div>

        <h2 className="mb-6 text-3xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-5xl">
          {t('footer.cta_title_prefix', { defaultValue: 'Stop writing boilerplate.' })}{' '}
          <span className="text-[var(--color-accent-primary)]">{t('footer.cta_title_suffix', { defaultValue: 'Start forging.' })}</span>
        </h2>

        <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          {t('footer.cta_desc', { defaultValue: 'Open the engine, describe the logic, and ship a working Skript before your coffee is cold.' })}
        </p>

        <Link
          href="/chat"
          className="btn-forge press group inline-flex items-center justify-center gap-2.5 rounded-xl px-10 py-4 text-sm font-bold"
        >
          {t('general.access_engine')}
          <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="dimension w-24" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">drawing approved</span>
          <span className="dimension w-24" />
        </div>

        {/* legal */}
        <p className="mx-auto mt-6 max-w-2xl text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          {t('status.legal_disclaimer')}
        </p>
      </motion.div>
    </section>
  );
}