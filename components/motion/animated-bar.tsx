"use client";

import { motion, useReducedMotion } from "motion/react";

/** Gold score bar that fills (scaleX, GPU-only) once when scrolled into view. */
export function AnimatedBar({
  value,
  delay = 0,
  className = "",
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={`relative block h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.08] ${className}`}
    >
      {/* Gold fill is sized to `value%`; the scaleX reveal grows it from the left.
          Animates on mount (not whileInView) so the fill is reliable even when the
          bar sits below the fold's visibility threshold on load. */}
      <motion.span
        className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-gold to-gold-bright"
        style={{ width: `${value}%` }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}
