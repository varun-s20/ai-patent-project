"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A hairline that draws itself left-to-right (scaleX, GPU-only) once when
 * scrolled into view. Pass the visible styling (position, height, gradient) via
 * `className`; this only owns the origin and the reveal. Static under reduced
 * motion. Used for section rules that should feel "drawn" rather than just present.
 */
export function DrawLine({
  className = "",
  delay = 0,
  duration = 0.7,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`block origin-left ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
