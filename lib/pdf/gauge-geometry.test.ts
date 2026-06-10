// lib/pdf/gauge-geometry.test.ts
import { describe, it, expect } from "vitest";
import {
  angleForScore,
  polarPoint,
  segmentedArcPath,
  colorForScore,
  clampScore,
} from "@/lib/pdf/gauge-geometry";

describe("gauge geometry", () => {
  it("maps score to angle on a 180->0 semicircle", () => {
    expect(angleForScore(0)).toBe(180);
    expect(angleForScore(100)).toBe(0);
    expect(angleForScore(50)).toBe(90);
  });

  it("clamps out-of-range scores", () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
    expect(clampScore(66.6)).toBe(67);
  });

  it("computes points on the circle (y grows downward)", () => {
    const top = polarPoint(50, 50, 40, 90);
    expect(top.x).toBeCloseTo(50, 5);
    expect(top.y).toBeCloseTo(10, 5); // 50 - 40
    const left = polarPoint(50, 50, 40, 180);
    expect(left.x).toBeCloseTo(10, 5);
    expect(left.y).toBeCloseTo(50, 5);
  });

  it("builds a segmented arc path of straight line segments (react-pdf renders these reliably)", () => {
    // 2 segments across the 180->0 semicircle sample angles 180, 90, 0.
    expect(segmentedArcPath(50, 50, 40, 180, 0, 2)).toBe(
      "M 10.00 50.00 L 50.00 10.00 L 90.00 50.00",
    );
  });

  it("collapses to a single move when start and end angles are equal (score 0 value arc)", () => {
    expect(segmentedArcPath(50, 50, 40, 180, 180, 24)).toBe("M 10.00 50.00");
  });

  it("color-codes by spec band (red <40 / amber 40-64 / green 65+)", () => {
    expect(colorForScore(20)).toBe("#C0392B"); // red
    expect(colorForScore(39)).toBe("#C0392B");
    expect(colorForScore(40)).toBe("#C8A020"); // amber
    expect(colorForScore(64)).toBe("#C8A020");
    expect(colorForScore(65)).toBe("#1E8449"); // green
  });
});
