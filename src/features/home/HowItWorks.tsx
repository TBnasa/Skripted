'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';
import { MessageSquare, Hammer, Rocket } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

type Step = {
  Icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
};

const STEPS: Step[] = [
  { Icon: MessageSquare, titleKey: 'how.step1_title', descKey: 'how.step1_desc', defaultTitle: 'Describe', defaultDesc: 'Tell the terminal what you want — a warp, an economy, a minigame. Plain language, in Turkish or English.' },
  { Icon: Hammer, titleKey: 'how.step2_title', descKey: 'how.step2_desc', defaultTitle: 'AI Forges', defaultDesc: 'The engine writes the Skript and audits every line for logic and performance with 120B parameter models.' },
  { Icon: Rocket, titleKey: 'how.step3_title', descKey: 'how.step3_desc', defaultTitle: 'Publish', defaultDesc: 'Save to your cloud, ship to your server, or share it in the gallery for the rest of the community.' },
];

export default function HowItWorks() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.001 });

  const lineScale = useTransform(p, [0.05, 0.85], [0, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--color-bg-primary)] px-6 py-28 md:py-36">
      <div className="absolute inset-0 blueprint-grid opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* heading */}
        <div className="mb-16 text-center">
          <div className="mono-label mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
            {t('how.eyebrow', { defaultValue: 'How it works' })}
            <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
          </div>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
            {t('how.title', { defaultValue: 'From idea to .sk in three steps.' })}
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Sheet 03/04 · Assembly Line</span>
        </div>

        {/* assembly line — continuous dashed baseline */}
        <div className="relative">
          {/* baseline (desktop horizontal / mobile vertical) */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px border-l-2 border-dashed border-[var(--color-border-active)] md:left-0 md:right-0 md:top-8 md:h-px md:w-full md:border-l-0 md:border-t-2">
            <motion.div
              style={reduce ? undefined : { scaleX: lineScale, scaleY: undefined, transformOrigin: 'left top' }}
              className="hidden h-full w-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-warm)] md:block"
            />
            <motion.div
              style={reduce ? undefined : { scaleY: lineScale, transformOrigin: 'top' }}
              className="h-full w-full bg-gradient-to-b from-[var(--color-accent-primary)] to-[var(--color-accent-warm)] md:hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <StationCard key={i} step={step} index={i} progress={p} reduce={reduce} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StationCard({
  step,
  index,
  progress,
  reduce,
}: {
  step: Step;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const { t } = useTranslation();
  const start = 0.1 + index * 0.18;
  const end = start + 0.22;
  const opacity = useTransform(progress, [start, end], reduce ? [1, 1] : [0, 1]);
  const y = useTransform(progress, [start, end], reduce ? [0, 0] : [24, 0]);

  const { Icon, titleKey, descKey, defaultTitle, defaultDesc } = step;
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div style={{ opacity, y }} className="relative flex flex-col items-center text-center md:items-start md:text-left">
      {/* station node on the baseline */}
      <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] md:h-16 md:w-16 ink-shadow-sm">
        <span className="font-mono text-base font-bold tabular-nums text-[var(--color-accent-primary)] md:text-lg">{num}</span>
      </div>

      <div className="press corner-ticks flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 transition-colors duration-300 hover:border-[var(--color-border-active)] md:p-7">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Station {num}</span>
        <div className="mb-3 mt-2 flex items-center justify-center gap-2.5 md:justify-start">
          <Icon className="h-4 w-4 text-[var(--color-accent-primary)]" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{t(titleKey, { defaultValue: defaultTitle })}</h3>
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{t(descKey, { defaultValue: defaultDesc })}</p>
      </div>
    </motion.div>
  );
}
