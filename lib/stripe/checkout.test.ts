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

  // Shared Stripe account: without `site` on BOTH objects, our charges can't be
  // told apart from the other three brands' — no per-site report, no payout.
  it("tags both session and payment intent for the shared account", () => {
    for (const meta of [params.metadata!, params.payment_intent_data!.metadata!]) {
      expect(meta.site).toBe("patentregister");
      expect(meta.env).toBe("test"); // no live key in the test env
      expect(meta.kind).toBe("evaluation");
    }
  });

  it("omits the statement descriptor suffix when unset", () => {
    expect(params.payment_intent_data!.statement_descriptor_suffix).toBeUndefined();
  });

  it("routes success and cancel urls", () => {
    expect(params.success_url).toBe("https://app.test/status/sub-1?paid=1");
    expect(params.cancel_url).toBe("https://app.test/pay/sub-1?canceled=1");
  });

  it("uses one-time payment mode with a prefilled email", () => {
    expect(params.mode).toBe("payment");
    expect(params.customer_email).toBe("buyer@example.com");
  });

  it("restricts to card payments (no delayed-notification methods)", () => {
    expect(params.payment_method_types).toEqual(["card"]);
  });
});

describe("buildCheckoutParams with a claim token", () => {
  const base = { submissionId: "sub-1", email: "ada@example.com", baseUrl: "https://x.test" };

  it("sends an anonymous payer to registration carrying the token", () => {
    const params = buildCheckoutParams({ ...base, claimToken: "tok+en/with=chars" });
    expect(params.success_url).toBe(
      "https://x.test/register?claim=tok%2Ben%2Fwith%3Dchars",
    );
  });

  it("sends a cancelled anonymous payer back to the public form, not the gated one", () => {
    const params = buildCheckoutParams({ ...base, claimToken: "tok" });
    expect(params.cancel_url).toBe("https://x.test/submit?canceled=1");
  });

  it("leaves the logged-in flow exactly as it was", () => {
    const params = buildCheckoutParams(base);
    expect(params.success_url).toBe("https://x.test/status/sub-1?paid=1");
    expect(params.cancel_url).toBe("https://x.test/pay/sub-1?canceled=1");
  });
});

describe("buildCheckoutParams for an owned submission with no session", () => {
  const base = { submissionId: "sub-1", email: "ada@example.com", baseUrl: "https://x.test" };

  // Signed out, but the email already had an account: the row is owned at
  // insert, so there is no claim token — and the status page is auth-gated,
  // so landing there directly would bounce them to /login with no context.
  it("sends them through login carrying the status page as the destination", () => {
    const params = buildCheckoutParams({ ...base, needsLogin: true });
    expect(params.success_url).toBe(
      "https://x.test/login?next=%2Fstatus%2Fsub-1&notice=paid",
    );
    expect(params.cancel_url).toBe("https://x.test/submit?canceled=1");
  });

  it("still prefers the claim route when a token exists", () => {
    const params = buildCheckoutParams({ ...base, claimToken: "tok", needsLogin: true });
    expect(params.success_url).toBe("https://x.test/register?claim=tok");
  });
});
