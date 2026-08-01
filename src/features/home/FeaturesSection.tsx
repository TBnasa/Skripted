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
      <div className="mx-auto mb-16 max-w-7xl">
        <div className="mb-4 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-accent-primary)]">
          <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
          {t('features.section_eyebrow', { defaultValue: 'Capabilities' })}
        </div>
        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
          {t('features.section_title_prefix', { defaultValue: 'Forge' })}{' '}
          <span className="text-[var(--color-text-muted)]">{t('features.section_title_suffix', { defaultValue: 'without limits.' })}</span>
        </h2>
      </div>

      {/* depth-parallax card grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <FeatureCard key={i} feature={f} index={i} progress={progress} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  progress,
  reduce,
}: {
  feature: Feature;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const start = 0.15 + index * 0.08;
  const end = start + 0.22;
  const opacity = useTransform(progress, [start, end], reduce ? [1, 1] : [0, 1]);
  const y = useTransform(progress, [start, end], reduce ? [0, 0] : [46, -8]);

  const { Icon, tone, title, desc } = feature;

  return (
    <motion.article
      style={{ opacity, y }}
      className="press group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-7 transition-colors duration-300 hover:border-[var(--color-border-hover)]"
    >
      {/* tone underglow on hover */}
      <div
        className="pointer-events-none absolute -bottom-px left-1/2 h-16 w-2/3 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
        style={{ background: tone }}
      />

      <div
        className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border"
        style={{
          color: tone,
          backgroundColor: `color-mix(in srgb, ${tone} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${tone} 24%, transparent)`,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mb-3 text-base font-bold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-text-secondary)]">
        {desc}
      </p>
    </motion.article>
  );
}