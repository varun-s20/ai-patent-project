import { describe, it, expect } from "vitest";
import { isCheckoutSessionId, nextStepFor } from "@/lib/payment/next-step";

describe("isCheckoutSessionId", () => {
  it("accepts test and live Checkout Session ids", () => {
    expect(isCheckoutSessionId("cs_test_a1B2c3D4e5F6g7H8i9J0")).toBe(true);
    expect(isCheckoutSessionId("cs_live_a1B2c3D4e5F6g7H8i9J0")).toBe(true);
  });

  it("rejects anything else before it reaches Stripe", () => {
    for (const bad of [
      undefined,
      "",
      "{CHECKOUT_SESSION_ID}",
      "pi_test_a1B2c3D4e5F6g7H8i9J0",
      "cs_test_short",
      "cs_test_a1B2c3D4e5F6/../../x",
      ["cs_test_a1B2c3D4e5F6g7H8i9J0"],
    ]) {
      expect(isCheckoutSessionId(bad)).toBe(false);
    }
  });
});

describe("nextStepFor", () => {
  const base = { submissionId: "sub-1", ownerId: null, claimToken: null, viewerId: null };

  it("sends an unclaimed anonymous payer to finish their account", () => {
    expect(nextStepFor({ ...base, claimToken: "tok+en/=" })).toEqual({
      kind: "register",
      href: "/register?claim=tok%2Ben%2F%3D",
    });
  });

  it("sends the signed-in owner straight to their status page", () => {
    expect(nextStepFor({ ...base, ownerId: "u1", viewerId: "u1" })).toEqual({
      kind: "status",
      href: "/status/sub-1",
    });
  });

  it("sends an owner who isn't signed in through login, back to the status page", () => {
    expect(nextStepFor({ ...base, ownerId: "u1" })).toEqual({
      kind: "login",
      href: "/login?next=%2Fstatus%2Fsub-1&notice=paid",
    });
  });

  it("does not hand someone else's status page to a different signed-in account", () => {
    expect(nextStepFor({ ...base, ownerId: "u1", viewerId: "u2" }).kind).toBe("login");
  });

  it("ignores a leftover token once the idea has been claimed", () => {
    expect(nextStepFor({ ...base, ownerId: "u1", claimToken: "tok", viewerId: "u1" }).kind).toBe(
      "status",
    );
  });
});
