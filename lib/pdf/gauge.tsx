// lib/pdf/gauge.tsx
import { Svg, Path, View, Text } from "@react-pdf/renderer";
import { angleForScore, segmentedArcPath, colorForScore, clampScore } from "@/lib/pdf/gauge-geometry";
import { brand } from "@/lib/pdf/theme";

/**
 * Credit-score-style semicircular gauge.
 * - The arc is drawn as straight line segments (segmentedArcPath) because
 *   @react-pdf/renderer renders elliptical-arc (`A`) commands unreliably.
 * - The number is a layout overlay (not SvgText) because react-pdf does not
 *   honor SvgText textAnchor, which left-shifted the value before.
 */
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
  const svgHeight = cy + 6;
  const track = segmentedArcPath(cx, cy, r, 180, 0);
  const value = segmentedArcPath(cx, cy, r, 180, angleForScore(s));

  return (
    <View style={{ width: size, alignItems: "center" }}>
      <View style={{ width: size, height: svgHeight, position: "relative" }}>
        <Svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
          <Path d={track} stroke={brand.line} strokeWidth={9} fill="none" />
          {s > 0 ? <Path d={value} stroke={colorForScore(s)} strokeWidth={9} fill="none" /> : null}
        </Svg>
        {/* Centered value, overlaid on the arc and anchored near its baseline. */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: cy,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 2,
          }}
        >
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 20, color: brand.navy }}>
            {String(s)}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 8, color: brand.muted, marginTop: 2 }}>{label.toUpperCase()}</Text>
    </View>
  );
}
