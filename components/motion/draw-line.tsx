"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

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
  style,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`block origin-left ${className}`}
      style={style}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

/**
 * A small glowing dot that travels across a line's bounding box as it draws —
 * pair with <DrawLine> using the same delay/duration/style so the spark reads
 * as the tip of the line being drawn, not a separate effect. The outer span
 * owns the segment's box (same left/right as the line it rides); the inner
 * dot animates `left` 0% → 100% of that box. Skipped under reduced motion.
 */
export function LineSpark({
  className = "",
  delay = 0,
  duration = 0.5,
  style,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span aria-hidden className={`absolute z-10 ${className}`} style={style}>
      <motion.span
        className="absolute h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold-bright shadow-[0_0_10px_2px_rgba(228,196,90,0.65)]"
        initial={{ left: "0%", opacity: 0 }}
        whileInView={{ left: "calc(100% - 6px)", opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration, delay, ease: "linear" }}
      />
    </span>
  );
}
