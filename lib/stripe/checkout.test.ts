import { describe, it, expect } from "vitest";
import {
  buildCheckoutParams,
  PRICE_CENTS,
  PRODUCT_DESCRIPTION,
  SUBMIT_MESSAGE,
} from "@/lib/stripe/checkout";

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
    expect(params.success_url).toBe(
      "https://app.test/payment-confirmed/return?session_id={CHECKOUT_SESSION_ID}",
    );
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

  // The onward register/login/status choice moved to the landing page
  // (lib/payment/next-step.ts) so marketing has one purchase URL to track.
  it("lands an anonymous payer on the shared confirmation page", () => {
    const params = buildCheckoutParams({ ...base, claimToken: "tok+en/with=chars" });
    expect(params.success_url).toBe(
      "https://x.test/payment-confirmed/return?session_id={CHECKOUT_SESSION_ID}",
    );
  });

  it("sends a cancelled anonymous payer back to the public form, not the gated one", () => {
    const params = buildCheckoutParams({ ...base, claimToken: "tok" });
    expect(params.cancel_url).toBe("https://x.test/submit?canceled=1");
  });

  it("leaves the logged-in flow exactly as it was", () => {
    const params = buildCheckoutParams(base);
    expect(params.success_url).toBe(
      "https://x.test/payment-confirmed/return?session_id={CHECKOUT_SESSION_ID}",
    );
    expect(params.cancel_url).toBe("https://x.test/pay/sub-1?canceled=1");
  });
});

describe("buildCheckoutParams for an owned submission with no session", () => {
  const base = { submissionId: "sub-1", email: "ada@example.com", baseUrl: "https://x.test" };

  // Signed out, but the email already had an account: the row is owned at
  // insert, so there is no claim token. The confirmation page routes them
  // through login; cancel can't use the auth-gated /pay page.
  it("lands on the confirmation page and cancels to the public form", () => {
    const params = buildCheckoutParams({ ...base, needsLogin: true });
    expect(params.success_url).toBe(
      "https://x.test/payment-confirmed/return?session_id={CHECKOUT_SESSION_ID}",
    );
    expect(params.cancel_url).toBe("https://x.test/submit?canceled=1");
  });
});

// The hosted page is the only screen where someone is asked for a card, and by
// default it shows a bare product name and "$49.00". These two strings are the
// entire explanation of what the money buys, so a silent drop is a conversion
// bug nothing else would catch.
describe("what the buyer actually sees on the Stripe page", () => {
  const params = buildCheckoutParams({
    submissionId: "sub-1",
    email: "buyer@example.com",
    baseUrl: "https://app.test",
  });

  it("describes the deliverables under the line item", () => {
    const description = params.line_items![0].price_data!.product_data!.description;
    expect(description).toBe(PRODUCT_DESCRIPTION);
    expect(description).toMatch(/Certificate of Idea Registration/);
  });

  it("puts the delivery and refund promise above the pay button", () => {
    // Stripe types `submit` as `"" | Submit` — the empty string is how you clear
    // the field — so it needs narrowing before reading .message.
    const submit = params.custom_text!.submit as { message: string };
    expect(submit.message).toBe(SUBMIT_MESSAGE);
    expect(SUBMIT_MESSAGE).toMatch(/refunded automatically/);
  });
});
