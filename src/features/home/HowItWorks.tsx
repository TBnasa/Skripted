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
      <div className="forge-glow absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* heading */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-accent-primary)]">
            <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
            {t('how.eyebrow', { defaultValue: 'How it works' })}
            <span className="h-px w-8 bg-[var(--color-accent-primary)]" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-balance text-[var(--color-text-primary)] md:text-6xl">
            {t('how.title', { defaultValue: 'From idea to .sk in three steps.' })}
          </h2>
        </div>

        {/* timeline */}
        <div className="relative">
          {/* vertical forge line — drawn as you scroll */}
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-[var(--color-border)] md:left-[31px]">
            <motion.div
              style={reduce ? undefined : { scaleY: lineScale, transformOrigin: 'top' }}
              className="h-full w-full bg-gradient-to-b from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/0"
            />
          </div>

          <ol className="space-y-6 md:space-y-8">
            {STEPS.map((step, i) => (
              <StepCard key={i} step={step} index={i} progress={p} reduce={reduce} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StepCard({
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
  const x = useTransform(progress, [start, end], reduce ? [0, 0] : [24, 0]);

  const { Icon, titleKey, descKey, defaultTitle, defaultDesc } = step;
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.li style={{ opacity, x }} className="relative flex items-start gap-5 md:gap-7">
      {/* number node */}
      <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border-active)] bg-[var(--color-bg-secondary)] md:h-16 md:w-16">
        <span className="font-mono text-base font-bold tabular-nums text-[var(--color-accent-primary)] md:text-lg">{num}</span>
      </div>

      {/* body */}
      <div className="press flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[var(--color-border-hover)] md:p-7">
        <div className="mb-3 flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[var(--color-accent-primary)]" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{t(titleKey, { defaultValue: defaultTitle })}</h3>
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{t(descKey, { defaultValue: defaultDesc })}</p>
      </div>
    </motion.li>
  );
}