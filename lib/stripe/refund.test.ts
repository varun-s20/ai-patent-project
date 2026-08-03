import { describe, expect, it } from "vitest";
import { isFullRefund } from "@/lib/stripe/refund";
import { PRICE_CENTS } from "@/lib/stripe/checkout";

describe("isFullRefund", () => {
  it("accepts the full $49", () => {
    expect(isFullRefund(PRICE_CENTS)).toBe(true);
  });

  // A partial refund leaves the customer having paid for, and still holding,
  // their report — flipping the row to "refunded" would revoke it and wrongly
  // credit the whole $49 back in the revenue figures.
  it("rejects a partial refund", () => {
    expect(isFullRefund(1000)).toBe(false);
    expect(isFullRefund(PRICE_CENTS - 1)).toBe(false);
    expect(isFullRefund(0)).toBe(false);
  });
});
