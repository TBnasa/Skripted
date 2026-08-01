'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { GraduationCap, ChevronDown } from 'lucide-react';

/* ── Example Skript drafted by the engine ── */
type Tok = { s: string; c?: string };
const KW = 'text-[var(--color-accent-primary)] font-semibold';
const STR = 'text-[var(--color-text-primary)]';
const VAR = 'text-[var(--color-accent-secondary)]';
const NUM = 'text-[var(--color-accent-primary)]';
const DIM = 'text-[var(--color-text-muted)]';

const LINES: Tok[][] = [
  [{ s: 'on', c: KW }, { s: ' join', c: STR }, { s: ':' }],
  [{ s: '    send ', c: STR }, { s: '"Hoş geldin, &e%player%&r!"', c: VAR }, { s: ' to player' }],
  [{ s: '    set ', c: KW }, { s: '{join::%player%}', c: VAR }, { s: ' to ', c: STR }, { s: 'now', c: NUM }],
  [{ s: '' }],
  [{ s: 'command', c: KW }, { s: ' /forge', c: STR }, { s: ':' }],
  [{ s: '    permission', c: KW }, { s: ': ', c: DIM }, { s: 'op', c: STR }],
  [{ s: '    trigger', c: KW }, { s: ':' }],
  [{ s: '        give ', c: KW }, { s: '1', c: NUM }, { s: ' diamond sword named ', c: STR }, { s: '"&bForge Blade"', c: VAR }, { s: ' to player' }],
];

/* ── Desktop-only gate ── pinned 3D choreography is a desktop experience;
   mobile renders a clean static hero. SSR-safe (false until mounted). */
function useIsDesktop() {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIs(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return is;
}

export default function HeroSection() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Spring-smoothed scroll feel
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });

  // ─ 3D scroll choreography (hooks run unconditionally before any return) ─
  const panelRotateY = useTransform(p, [0, 1], [0, -24]);
  const panelRotateX = useTransform(p, [0, 1], [0, 8]);
  const panelY = useTransform(p, [0, 1], [0, -80]);
  const panelScale = useTransform(p, [0, 1], [1, 0.94]);
  const headY = useTransform(p, [0, 1], [0, -120]);
  const headOpacity = useTransform(p, [0, 0.6], [1, 0]);
  const ctaY = useTransform(p, [0, 1], [0, -60]);
  const ctaOpacity = useTransform(p, [0, 0.5, 0.8], [1, 1, 0]);
  const hintOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const hintY = useTransform(p, [0, 0.12], [0, 12]);

  // ─ Reduced motion: static fallback ─
  if (reduce) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] forge-glow">
        <div className="absolute inset-0 blueprint-grid opacity-60" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-16 pb-16 md:flex-row md:items-center md:gap-12">
          <TextBlock />
          <div className="mt-12 w-full md:mt-0 md:flex-1">
            <CodePanel lines={LINES} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative min-h-screen bg-[var(--color-bg-primary)] md:min-h-[185vh]">
      <motion.div className="relative min-h-screen md:sticky md:top-0 md:h-screen md:overflow-hidden">
        {/* Background ─ blueprint graph paper + blue wash + drifting sparks */}
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <div className="forge-glow absolute inset-0" />
        <EmberField />
        <Crosshairs />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-24 pt-24 md:pt-16">
          <div className="md:grid md:grid-cols-12 md:items-center md:gap-6">
            {/* ── Left: spec block ── */}
            <motion.div style={isDesktop ? { y: headY, opacity: headOpacity } : undefined} className="w-full text-center md:col-span-6 lg:col-span-5 xl:col-span-6 md:text-left">
              {/* Draft label */}
              <div className="animate-fade-in mx-auto mb-9 flex w-fit items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 md:mx-0 ink-shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
                </span>
                <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[var(--color-text-secondary)]">
                  SKRIPTED ENGINE · REV 2.1
                </span>
              </div>

              {/* Headline ─ oversized tight-tracked Satoshi Black */}
              <h1 className="mb-7 text-5xl font-black leading-[0.92] tracking-tighter text-balance sm:text-7xl md:text-[5.5rem]">
                <span className="block animate-slide-up text-[var(--color-text-primary)]">{t('hero.title_1')}</span>
                <span className="block animate-slide-up text-[var(--color-accent-primary)]" style={{ animationDelay: '0.06s' }}>
                  {t('hero.title_2')}
                </span>
              </h1>

              <p className="animate-fade-in mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:mx-0" style={{ animationDelay: '0.18s' }}>
                {t('hero.desc')}
              </p>

              {/* CTAs ─ parallax + press feedback */}
              <motion.div style={isDesktop ? { y: ctaY, opacity: ctaOpacity } : undefined} className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:items-start">
                <Link
                  href="/chat"
                  className="btn-forge press group relative inline-flex w-full items-center justify-center rounded-xl px-10 py-4 text-sm font-bold sm:w-auto"
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
                  className="press flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-4 text-center text-sm font-semibold text-[var(--color-text-muted)] sm:w-auto"
                  title={t('general.academy_tooltip')}
                >
                  <GraduationCap className="h-4 w-4" />
                  {t('hero.start_learning')}
                  <span className="text-[10px] italic text-[var(--color-text-muted)]">({t('general.soon')})</span>
                </div>

                <Link
                  href="/gallery"
                  className="press group w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-4 text-center text-sm font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-border-active)] hover:text-[var(--color-accent-primary)] sm:w-auto"
                >
                  {t('hero.explore_gallery')}
                </Link>
              </motion.div>
            </motion.div>

            {/* ── Right: 3D drafting sheet, bleeds off the right edge ── */}
            <div className="mt-14 w-full md:col-span-6 md:mt-0 lg:col-span-7" style={{ perspective: 1200 }}>
              <motion.div
                style={isDesktop ? { rotateY: panelRotateY, rotateX: panelRotateX, y: panelY, scale: panelScale, transformStyle: 'preserve-3d' } : undefined}
                className="preserve-3d md:translate-x-6 lg:translate-x-14"
              >
                <CodePanel
                  lines={LINES}
                  interactive
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll hint ─ fades on first scroll; desktop-only */}
        <motion.div
          style={isDesktop ? { opacity: hintOpacity, y: hintY } : undefined}
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            {t('hero.scroll_hint', { defaultValue: 'Scroll' })}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--color-accent-primary)] animate-subtle-pulse" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────── Text block (reused in reduced-motion) ───────────────────────── */
function TextBlock() {
  const { t } = useTranslation();
  return (
    <div className="w-full text-center md:flex-1 md:text-left">
      <div className="mx-auto mb-9 flex w-fit items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 md:mx-0 ink-shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
        </span>
        <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[var(--color-text-secondary)]">
          SKRIPTED ENGINE · REV 2.1
        </span>
      </div>
      <h1 className="mb-7 text-5xl font-black leading-[0.92] tracking-tighter text-balance text-[var(--color-text-primary)] sm:text-7xl md:text-[5.5rem]">
        {t('hero.title_1')} <span className="block text-[var(--color-accent-primary)]">{t('hero.title_2')}</span>
      </h1>
      <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:mx-0">
        {t('hero.desc')}
      </p>
    </div>
  );
}

/* ───────────────────────── Blueprint drafting sheet ───────────────────────── */
function CodePanel({
  lines,
  reveal,
  interactive,
}: {
  lines: Tok[][];
  reveal?: MotionValue<string>;
  interactive?: boolean;
}) {
  return (
    <div
      role="figure"
      aria-label="Example Skript drafted by the engine"
      className="corner-ticks glass-panel relative overflow-hidden rounded-xl p-0"
    >
      {/* sheet header — technical drawing strip */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            schematic · forge.sk
          </span>
        </div>
        <span className="stamp text-[9px]">Rev 2.1</span>
      </div>

      {/* dimension rule */}
      <div className="dimension relative mx-5 mt-4 flex items-center justify-between">
        <span className="h-1 w-1 rounded-full bg-[var(--color-accent-primary)]" />
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]">spec · sheet 01</span>
        <span className="h-1 w-1 rounded-full bg-[var(--color-accent-primary)]" />
      </div>

      {/* code body — ink on paper */}
      <motion.div
        style={{ ...(reveal ? { clipPath: reveal } : {}) }}
        className="m-5 overflow-hidden rounded-lg border border-[var(--color-border)]"
      >
        <pre aria-hidden className="blueprint-grid overflow-hidden bg-[var(--color-bg-secondary)] p-4 font-mono text-[12.5px] leading-[1.85] sm:text-[13.5px]">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-3 w-5 shrink-0 select-none text-right text-[var(--color-text-muted)]/60">{i + 1}</span>
              <span className="whitespace-pre">
                {line.length === 0 || (line.length === 1 && line[0].s === '') ? (
                  <span>&nbsp;</span>
                ) : (
                  line.map((tok, j) => (
                    <span key={j} className={tok.c ?? 'text-[var(--color-text-secondary)]'}>
                      {tok.s}
                    </span>
                  ))
                )}
              </span>
              {interactive && i === lines.length - 1 && (
                <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] bg-[var(--color-accent-primary)] animate-subtle-pulse" />
              )}
            </div>
          ))}
        </pre>
      </motion.div>

      {/* blue underlight */}
      <div className="pointer-events-none absolute -bottom-px left-1/2 h-12 w-3/4 -translate-x-1/2 rounded-full bg-[var(--color-accent-primary)] opacity-10 blur-2xl" />

      {/* title block — real drafting sheet footer */}
      <div className="flex items-stretch border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        <span className="border-r border-[var(--color-border)] px-3 py-2">Proj: Skripted_Engine</span>
        <span className="hidden border-r border-[var(--color-border)] px-3 py-2 sm:block">Sheet: 1/1</span>
        <span className="border-r border-[var(--color-border)] px-3 py-2">Rev: 2.1</span>
        <span className="ml-auto px-3 py-2 text-[var(--color-accent-primary)]">Scale 1:1</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Background crosshair registration marks ───────────────────────── */
function Crosshairs() {
  const marks = [
    { l: '2%', t: '6%', label: '0, 0' },
    { l: '2%', t: '88%', label: '0, 640' },
    { l: '92%', t: '6%', label: '1280, 0' },
  ];
  return (
    <div aria-hidden className="absolute inset-0 hidden md:block">
      {marks.map((m, i) => (
        <div key={i} className="absolute flex items-center gap-2" style={{ left: m.l, top: m.t }}>
          <span className="relative block h-3 w-3">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-border-active)]/70" />
            <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-[var(--color-border-active)]/70" />
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-[var(--color-text-muted)]">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Decorative drifting sparks ───────────────────────── */
function EmberField() {
  const embers = [
    { l: '12%', t: '70%', d: '0s', s: 3 },
    { l: '84%', t: '78%', d: '0.8s', s: 2 },
    { l: '23%', t: '86%', d: '1.6s', s: 2 },
    { l: '68%', t: '64%', d: '2.4s', s: 3 },
    { l: '47%', t: '92%', d: '3.2s', s: 2 },
    { l: '92%', t: '88%', d: '1.2s', s: 2 },
  ];
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="animate-ember absolute rounded-full bg-[var(--color-accent-primary)]"
          style={{
            left: e.l,
            top: e.t,
            width: e.s,
            height: e.s,
            animationDelay: e.d,
            boxShadow: '0 0 8px var(--color-accent-primary)',
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}
