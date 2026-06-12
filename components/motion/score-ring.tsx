"use client";

import { motion, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/motion/count-up";

/**
 * Circular score gauge whose gold arc sweeps from 0 to `value`% once scrolled
 * into view, in step with the dimension bars and the counting numerals. The
 * arc is an SVG stroke (pathLength), so it animates on the GPU compositor.
 */
export function ScoreRing({
  value,
  delay = 0,
  label = "Overall",
}: {
  value: number;
  delay?: number;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const fraction = value / 100;

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" strokeWidth="7" className="stroke-ink/[0.07]" />
        <defs>
          <linearGradient id="scoreRingGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" />
            <stop offset="100%" stopColor="var(--color-gold-bright)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#scoreRingGold)"
          strokeWidth="7"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: fraction }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-ink">
          <CountUp to={value} />
        </span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted">{label}</span>
      </div>
    </div>
  );
}
