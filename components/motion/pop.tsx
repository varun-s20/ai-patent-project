"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Springs a small element into place (scale 0.9 -> 1 with a faint bounce) on
 * mount, after an optional delay — for status badges that are the *result* of a
 * preceding animation (e.g. a verdict chip that lands once the score settles).
 * Never scales from 0; reduced motion shows it statically.
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
      transition={{ type: "spring", duration: 0.5, bounce: 0.3, delay }}
    >
      {children}
    </motion.span>
  );
}
