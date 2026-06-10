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
 * Arc from startAngle to endAngle along radius r, approximated as a chain of straight
 * line segments (M..L..L). @react-pdf/renderer renders elliptical-arc (`A`) commands
 * unreliably, so we sample the arc into `segments` straight pieces it can draw correctly.
 * Consecutive coincident points are collapsed (so a zero-length arc yields just a move).
 */
export function segmentedArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  segments = 24,
): string {
  const cmds: string[] = [];
  let prev = "";
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / segments;
    const p = polarPoint(cx, cy, r, angle);
    const coord = `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    if (coord === prev) continue;
    cmds.push(`${cmds.length === 0 ? "M" : "L"} ${coord}`);
    prev = coord;
  }
  return cmds.join(" ");
}

/** Spec §8 color bands: red <40, amber 40–64, green 65+. */
export function colorForScore(score: number): string {
  const s = clampScore(score);
  if (s < 40) return "#C0392B";
  if (s < 65) return "#C8A020";
  return "#1E8449";
}
