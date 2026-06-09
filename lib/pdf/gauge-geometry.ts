// lib/pdf/gauge-geometry.ts
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Angle (deg) for a score on a 180°(left) → 0°(right) semicircle. */
export function angleForScore(score: number): number {
  return 180 - (clampScore(score) / 100) * 180;
}

/** Point on a circle. angle in deg: 0°=right, 90°=top. y grows downward (SVG convention). */
export function polarPoint(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/**
 * SVG arc path from startAngle to endAngle along radius r.
 * For our top semicircle, callers pass sweepFlag = 0 so the arc bows upward.
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  sweepFlag: 0 | 1 = 0,
): string {
  const start = polarPoint(cx, cy, r, startAngle);
  const end = polarPoint(cx, cy, r, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/** Spec §8 color bands: red <40, amber 40–64, green 65+. */
export function colorForScore(score: number): string {
  const s = clampScore(score);
  if (s < 40) return "#C0392B";
  if (s < 65) return "#C8A020";
  return "#1E8449";
}
