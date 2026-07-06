"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Settles a small element into place (scale 0.9 -> 1, fade in) on mount,
 * after an optional delay — for status badges that are the *result* of a
 * preceding animation (e.g. a verdict chip that lands once the score settles).
 * Never scales from 0; reduced motion shows it statically. Uses the same
 * restrained cubic-bezier ease as the rest of the motion library — no spring/
 * bounce, which reads as a "childish" micro-interaction on this product.
 */
export function Pop({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  );
}
