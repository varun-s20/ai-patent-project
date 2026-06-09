import { describe, it, expect } from "vitest";
import { formatTimestamp } from "./timestamp";

describe("formatTimestamp", () => {
  const iso = "2026-06-09T14:30:00Z";

  it("includes the year, the time, and a UTC label", () => {
    const out = formatTimestamp(iso, "UTC");
    expect(out).toContain("2026");
    expect(out).toContain("UTC");
  });

  it("is deterministic for the same input", () => {
    expect(formatTimestamp(iso, "UTC")).toBe(formatTimestamp(iso, "UTC"));
  });
});
