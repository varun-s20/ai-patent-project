import { describe, it, expect } from "vitest";
import { statusLabel, statusBadgeClasses } from "@/lib/ui/status";

describe("statusLabel", () => {
  it("title-cases known statuses", () => {
    expect(statusLabel("complete")).toBe("Complete");
    expect(statusLabel("processing")).toBe("Processing");
    expect(statusLabel("refunded")).toBe("Refunded");
  });
});

describe("statusBadgeClasses", () => {
  it("greens complete, reds failed/refunded, ambers in-flight, grays draft", () => {
    expect(statusBadgeClasses("complete")).toContain("emerald");
    expect(statusBadgeClasses("failed")).toContain("red");
    expect(statusBadgeClasses("refunded")).toContain("red");
    expect(statusBadgeClasses("processing")).toContain("amber");
    expect(statusBadgeClasses("paid")).toContain("amber");
    expect(statusBadgeClasses("draft")).toContain("gray");
  });
});
