"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The patent/registration mark, drawn on mount: the medallion ring traces first,
 * then the ribbon, then the inner check lands last as the "verified" beat. Mirrors
 * the geometry of <Patent> in ui/icons. Static (fully drawn) under reduced motion.
 */
export function SealMark({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  const draw = (delay: number, duration: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration, delay, ease: [0.16, 1, 0.3, 1] as const },
            opacity: { duration: 0.15, delay },
          },
        };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.circle cx="12" cy="8.5" r="5.5" {...draw(0.2, 0.9)} />
      <motion.path d="M8.7 13.3 7 21l5-2.6 5 2.6-1.7-7.7" {...draw(0.55, 0.8)} />
      <motion.path d="m9.6 8.7 1.7 1.7 3.1-3.3" {...draw(1.15, 0.5)} />
    </svg>
  );
}
