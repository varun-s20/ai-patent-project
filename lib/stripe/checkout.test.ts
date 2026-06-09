import { describe, it, expect } from "vitest";
import { buildCheckoutParams, PRICE_CENTS } from "@/lib/stripe/checkout";

describe("buildCheckoutParams", () => {
  const params = buildCheckoutParams({
    submissionId: "sub-1",
    email: "buyer@example.com",
    baseUrl: "https://app.test",
  });

  it("charges the flat $49 price in USD", () => {
    expect(PRICE_CENTS).toBe(4900);
    const item = params.line_items![0];
    expect(item.price_data!.unit_amount).toBe(4900);
    expect(item.price_data!.currency).toBe("usd");
  });

  it("carries the submission id in session + payment-intent metadata", () => {
    expect(params.metadata!.submission_id).toBe("sub-1");
    expect(params.payment_intent_data!.metadata!.submission_id).toBe("sub-1");
  });

  it("routes success and cancel urls", () => {
    expect(params.success_url).toBe("https://app.test/status/sub-1?paid=1");
    expect(params.cancel_url).toBe("https://app.test/pay/sub-1?canceled=1");
  });

  it("uses one-time payment mode with a prefilled email", () => {
    expect(params.mode).toBe("payment");
    expect(params.customer_email).toBe("buyer@example.com");
  });
});
