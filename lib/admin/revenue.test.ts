// lib/admin/revenue.test.ts
import { describe, it, expect } from "vitest";
import { computeRevenue, UNIT_PRICE } from "./revenue";

describe("computeRevenue", () => {
  it("uses the $49 unit price", () => {
    expect(UNIT_PRICE).toBe(49);
  });
  it("computes gross/refunds/net", () => {
    const r = computeRevenue({ paidCount: 10, refundedCount: 2 });
    expect(r.gross).toBe(490);
    expect(r.refunds).toBe(98);
    expect(r.net).toBe(392);
  });
  it("handles zero", () => {
    expect(computeRevenue({ paidCount: 0, refundedCount: 0 })).toEqual({
      gross: 0,
      refunds: 0,
      net: 0,
      paidCount: 0,
      refundedCount: 0,
    });
  });
});
