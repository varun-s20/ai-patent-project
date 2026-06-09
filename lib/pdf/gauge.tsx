// lib/pdf/gauge.tsx
import { Svg, Path, Text as SvgText } from "@react-pdf/renderer";
import {
  angleForScore,
  describeArc,
  colorForScore,
  clampScore,
} from "@/lib/pdf/gauge-geometry";
import { brand } from "@/lib/pdf/theme";

/** Credit-score-style semicircular gauge. */
export function ScoreGauge({
  score,
  label,
  size = 108,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const s = clampScore(score);
  const cx = size / 2;
  const cy = size / 2 + 6; // baseline of the semicircle
  const r = size / 2 - 12;
  const track = describeArc(cx, cy, r, 180, 0, 0);
  const value = describeArc(cx, cy, r, 180, angleForScore(s), 0);
  const height = cy + 26;

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
      <Path d={track} stroke={brand.line} strokeWidth={9} fill="none" />
      <Path d={value} stroke={colorForScore(s)} strokeWidth={9} fill="none" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SvgText x={cx} y={cy - 2} textAnchor="middle" fill={brand.navy} style={{ fontSize: 22 } as any}>
        {String(s)}
      </SvgText>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SvgText x={cx} y={cy + 20} textAnchor="middle" fill={brand.muted} style={{ fontSize: 8 } as any}>
        {label.toUpperCase()}
      </SvgText>
    </Svg>
  );
}
