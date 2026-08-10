// lib/report/registered-at.test.ts
import { describe, expect, it } from "vitest";
import { registeredAt } from "@/lib/report/registered-at";

const fallback = new Date("2026-08-10T14:00:00.000Z");

describe("registeredAt", () => {
  it("uses the payment time, not the render time", () => {
    expect(registeredAt("2026-08-10T13:32:07.000Z", fallback).toISOString()).toBe(
      "2026-08-10T13:32:07.000Z",
    );
  });

  // A certificate with no timestamp is worthless, so a missing or corrupt
  // paid_at degrades to the render time rather than throwing and failing an
  // evaluation the customer has already paid for.
  it("falls back rather than failing the evaluation", () => {
    expect(registeredAt(null, fallback)).toBe(fallback);
    expect(registeredAt(undefined, fallback)).toBe(fallback);
    expect(registeredAt("not a date", fallback)).toBe(fallback);
  });
});
