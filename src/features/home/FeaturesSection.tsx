'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';
import { Brain, Shield, Zap, GraduationCap } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

type Feature = {
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

export default function FeaturesSection() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const features: Feature[] = [
    { title: t('features.feature1_title'), desc: t('features.feature1_desc'), Icon: Brain, tone: 'var(--color-accent-primary)' },
    { title: t('features.feature2_title'), desc: t('features.feature2_desc'), Icon: Shield, tone: 'var(--color-accent-warm)' },
    { title: t('features.feature3_title'), desc: t('features.feature3_desc'), Icon: Zap, tone: 'var(--color-accent-secondary)' },
    { title: t('features.feature4_title'), desc: t('features.feature4_desc'), Icon: GraduationCap, tone: 'var(--color-accent-primary)' },
  ];

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.001 });

  return (
    <section ref={ref} className="relative bg-[var(--color-bg-primary)] px-6 py-28 md:py-36">
      {/* eyebrow + heading */}
      <div className="mx-auto mb-14 max-w-7xl">
        <div className="mono-label mb-4 flex items-center gap-2">
          <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
          {t('features.section_eyebrow', { defaultValue: 'Capabilities' })}
          <span className="ml-3 h-px flex-1 max-w-[160px] bg-[var(--color-border)]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--color-text-muted)]">SHEET 02/04</span>
        </div>
        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
          {t('features.section_title_prefix', { defaultValue: 'Forge' })}{' '}
          <span className="text-[var(--color-accent-primary)]">{t('features.section_title_suffix', { defaultValue: 'without limits.' })}</span>
        </h2>
      </div>

      {/* spec ledger — dashed-row specification table */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ink-shadow">
        {/* ledger header */}
        <div className="hidden grid-cols-12 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-6 py-3 md:grid">
          <span className="col-span-2 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Item</span>
          <span className="col-span-7 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Specification</span>
          <span className="col-span-3 text-right font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Status</span>
        </div>

        {features.map((f, i) => (
          <LedgerRow key={i} feature={f} index={i} progress={progress} reduce={reduce} last={i === features.length - 1} />
        ))}
      </div>
    </section>
  );
}

function LedgerRow({
  feature,
  index,
  progress,
  reduce,
  last,
}: {
  feature: Feature;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
  last: boolean;
}) {
  const start = 0.12 + index * 0.1;
  const end = start + 0.18;
  const opacity = useTransform(progress, [start, end], reduce ? [1, 1] : [0, 1]);
  const x = useTransform(progress, [start, end], reduce ? [0, 0] : [24, 0]);

  const { Icon, tone, title, desc } = feature;
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      style={{ opacity, x }}
      className={`group relative grid grid-cols-12 items-center gap-4 px-5 py-7 transition-colors duration-300 hover:bg-[var(--color-accent-glow)] md:px-6 ${
        last ? '' : 'border-b border-dashed border-[var(--color-border)]'
      }`}
    >
      {/* corner ticks on hover */}
      <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-[var(--color-accent-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[var(--color-accent-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* item number */}
      <div className="col-span-12 flex items-center gap-4 md:col-span-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border"
          style={{
            color: tone,
            backgroundColor: `color-mix(in srgb, ${tone} 10%, transparent)`,
            borderColor: `color-mix(in srgb, ${tone} 26%, transparent)`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-[var(--color-accent-primary)]">ITEM {num}</span>
      </div>

      {/* specification */}
      <div className="col-span-12 md:col-span-7">
        <h3 className="mb-1.5 text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
        <p className="max-w-xl text-sm leading-relaxed text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-text-secondary)]">
          {desc}
        </p>
      </div>

      {/* status */}
      <div className="col-span-12 flex items-center justify-start md:col-span-3 md:justify-end">
        <span className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-text-secondary)] transition-colors duration-300 group-hover:border-[var(--color-border-active)] group-hover:text-[var(--color-accent-primary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" />
          OK
        </span>
      </div>
    </motion.div>
  );
}
