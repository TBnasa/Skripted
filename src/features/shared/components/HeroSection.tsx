'use client';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { GraduationCap, ChevronDown } from 'lucide-react';

/* ── Example Skript forged by the engine ── */
type Tok = { s: string; c?: string };
const KW = 'text-[var(--color-accent-primary)]';
const STR = 'text-[var(--color-text-primary)]';
const VAR = 'text-[var(--color-accent-secondary)]';
const NUM = 'text-[var(--color-accent-warm)]';
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

  // ─ 3D scroll choreography (hooks must run unconditionally before any return) ─
  // All transforms start at the identity (p=0) so the desktop-applied state matches
  // the static first paint → no mount-time flash.
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

  // ─ Reduced motion: static fallback (motion values computed above are ignored) ─
  if (reduce) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] forge-glow">
        <div className="absolute inset-0 line-grid opacity-30" />
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
        {/* Background ─ faint warm grid + ember glow + drifting ember dots */}
        <div className="absolute inset-0 line-grid opacity-40" />
        <div className="forge-glow absolute inset-0" />
        <EmberField />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-20 md:h-full md:flex-row md:items-center md:gap-10">
          {/* ── Left: copy + CTAs (parallax depth) ── */}
          <motion.div style={isDesktop ? { y: headY, opacity: headOpacity } : undefined} className="w-full text-center md:flex-1 md:text-left">
            {/* Version badge */}
            <div className="animate-fade-in mx-auto mb-9 flex w-fit items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 md:mx-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
              </span>
              <span className="font-mono text-[11px] font-medium tracking-wide text-[var(--color-text-secondary)]">
                Skripted Engine v2.1.0-beta
              </span>
            </div>

            {/* Headline ─ oversized tight-tracked Satoshi Black */}
            <h1 className="mb-7 text-5xl font-black leading-[0.92] tracking-tighter text-balance sm:text-7xl md:text-[5.5rem]">
              <span className="block animate-slide-up text-[var(--color-text-primary)]">{t('hero.title_1')}</span>
              <span className="block animate-slide-up text-[var(--color-accent-primary)] glow-text" style={{ animationDelay: '0.06s' }}>
                {t('hero.title_2')}
              </span>
            </h1>

            <p className="animate-fade-in mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:mx-0" style={{ animationDelay: '0.18s' }}>
              {t('hero.desc')}
            </p>

            {/* CTAs ─ parallax + press feedback (no CSS entrance anim — scroll motion drives opacity) */}
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
                className="press group w-full rounded-xl border border-[var(--color-border)] bg-transparent px-8 py-4 text-center text-sm font-semibold text-[var(--color-text-secondary)] transition-colors duration-200 hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] sm:w-auto"
              >
                {t('hero.explore_gallery')}
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Right: 3D Code Forge panel ── */}
          <div className="mt-14 w-full md:mt-0 md:flex-1" style={{ perspective: 1200 }}>
            <motion.div
              style={isDesktop ? { rotateY: panelRotateY, rotateX: panelRotateX, y: panelY, scale: panelScale, transformStyle: 'preserve-3d' } : undefined}
              className="preserve-3d"
            >
              <CodePanel
                lines={LINES}
                interactive
              />
            </motion.div>
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
      <div className="mx-auto mb-9 flex w-fit items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 md:mx-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] animate-subtle-pulse" />
        </span>
        <span className="font-mono text-[11px] font-medium tracking-wide text-[var(--color-text-secondary)]">
          Skripted Engine v2.1.0-beta
        </span>
      </div>
      <h1 className="mb-7 text-5xl font-black leading-[0.92] tracking-tighter text-balance text-[var(--color-text-primary)] sm:text-7xl md:text-[5.5rem]">
        {t('hero.title_1')} <span className="block text-[var(--color-accent-primary)] glow-text">{t('hero.title_2')}</span>
      </h1>
      <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:mx-0">
        {t('hero.desc')}
      </p>
    </div>
  );
}

/* ───────────────────────── Code Forge panel ───────────────────────── */
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
      aria-label="Example Skript produced by the engine"
      className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6"
    >
      {/* window chrome */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-error)]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-warning)]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-success)]/70" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          forge.sk
        </span>
      </div>

      {/* code body — reveal clipped top→bottom as the engine "writes" */}
      <motion.div
        style={{ ...(reveal ? { clipPath: reveal } : {}), backgroundColor: 'oklch(18% 0.010 55)' }}
        className="overflow-hidden rounded-xl border border-[var(--color-border)]"
      >
        <pre aria-hidden className="overflow-hidden p-4 font-mono text-[12.5px] leading-[1.85] sm:text-[13.5px]">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-3 w-5 shrink-0 select-none text-right text-[var(--color-text-muted)]/50">{i + 1}</span>
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
                <span className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] bg-[var(--color-accent-primary)]" />
              )}
            </div>
          ))}
        </pre>
      </motion.div>

      {/* ember underglow */}
      <div className="pointer-events-none absolute -bottom-px left-1/2 h-12 w-3/4 -translate-x-1/2 rounded-full bg-[var(--color-accent-primary)] opacity-10 blur-2xl" />
    </div>
  );
}

/* ───────────────────────── Decorative drifting embers ───────────────────────── */
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