"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A checkmark that draws its stroke (pathLength, GPU compositor) once when
 * scrolled into view — for checklists that should feel like they're being ticked
 * off. Matches the line weight of the icon set. Static under reduced motion.
 */
export function AnimatedCheck({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <motion.path
        d="m5 12.5 4.5 4.5L19 7"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
