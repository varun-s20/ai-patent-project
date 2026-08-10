import { describe, expect, it } from "vitest";
import { formatStamp } from "@/lib/urgency/format-stamp";

describe("formatStamp", () => {
  it("formats a UTC instant as 'YYYY-MM-DD · HH:mm:ss UTC'", () => {
    expect(formatStamp(new Date("2026-08-10T14:23:45.123Z"))).toBe("2026-08-10 · 14:23:45 UTC");
  });

  // Zero-padding is the whole point of building this from field getters instead
  // of slicing the ISO string — single-digit fields must not collapse the width.
  it("zero-pads single-digit month, day, hour, minute and second", () => {
    expect(formatStamp(new Date("2026-01-05T04:07:09.000Z"))).toBe("2026-01-05 · 04:07:09 UTC");
  });
});
