'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Fixed amber scroll-progress bar at the very top of the viewport.
 * Tied to overall page scroll progress — the "forge" filling up.
 * Respects reduced-motion (renders a static half-filled bar).
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  if (reduce) {
    return <div className="scroll-progress" style={{ transform: 'scaleX(0.5)' }} aria-hidden />;
  }

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden
    />
  );
}