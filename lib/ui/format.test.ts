import { describe, it, expect } from "vitest";
import { formatDate } from "@/lib/ui/format";

describe("formatDate", () => {
  it("formats an ISO string as a long en-US date", () => {
    expect(formatDate("2026-06-10T12:00:00.000Z")).toBe("June 10, 2026");
  });
  it("returns an em dash for null/empty", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});
