"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Gold diamonds thrown outward once as the seal lands — the same rotated
// square the hero uses as its list bullet, so it reads as the brand's mark
// rather than party confetti.
const GLINTS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const radius = i % 2 === 0 ? 104 : 84;
  return {
    x: Math.round(Math.cos(angle) * radius),
    y: Math.round(Math.sin(angle) * radius),
    size: i % 2 === 0 ? 7 : 5,
    delay: 0.62 + (i % 3) * 0.05,
  };
});

/**
 * The confirmation moment: a navy notary seal with a brushed-gold rim settles
 * into place, its check draws, two rings ripple out and a ring of gold glints
 * scatters. Plays once, no springs or loops beyond a very slow rim drift.
 * Under reduced motion everything renders in its final state.
 */
export function ConfirmedSeal() {
  const reduce = useReducedMotion();

  return (
    <div
      role="img"
      aria-label="Payment confirmed"
      className="relative mx-auto grid h-40 w-40 place-items-center"
    >
      {/* Warm bloom behind the seal — the page's single light source. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-20 rounded-full bg-[radial-gradient(closest-side,rgba(228,196,90,0.28),rgba(228,196,90,0.08)_55%,transparent)]"
      />

      {!reduce &&
        [0, 1].map((ring) => (
          <motion.span
            key={ring}
            aria-hidden
            className="absolute inset-4 rounded-full ring-1 ring-gold/50"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.75], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, delay: 0.55 + ring * 0.35, ease: EASE }}
          />
        ))}

      {!reduce &&
        GLINTS.map((g, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-[1.5px] bg-gold ring-1 ring-gold-bright/60"
            style={{ width: g.size, height: g.size, rotate: 45 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: g.x, y: g.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ duration: 1.25, delay: g.delay, ease: EASE, times: [0, 0.3, 1] }}
          />
        ))}

      <motion.div
        className="js-reveal relative h-28 w-28 rounded-full bg-[conic-gradient(from_210deg,#a9821a,#f3dc8a,#c8a020,#e7c862,#a9821a)] p-[3px] shadow-[0_22px_50px_-18px_rgba(13,22,38,0.65),0_0_0_8px_rgba(255,255,255,0.7)]"
        initial={reduce ? false : { opacity: 0, scale: 0.82, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-to-b from-navy-800 to-navy-900">
          {/* Specular highlight across the top of the disc. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(255,255,255,0.14),transparent)]"
          />
          {/* Stamp rim: a fine dashed ring that drifts very slowly. */}
          <motion.svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-[7px] text-gold-bright/45"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="1.5 4"
            />
          </motion.svg>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative h-12 w-12 text-gold-bright drop-shadow-[0_0_10px_rgba(228,196,90,0.45)]"
          >
            <motion.path
              d="m5 12.5 4.5 4.5L19 7"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
