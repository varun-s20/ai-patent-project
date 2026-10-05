/**
 * Where a buyer goes after /payment-confirmed. Every paid checkout lands on
 * that one page (it is the purchase URL marketing tracks), so this picks the
 * onward step that used to be baked into three different Stripe success URLs.
 *
 * Decided at landing time, not at checkout time, so it stays right if the
 * buyer comes back later: once they have claimed the idea and are signed in,
 * the same link takes them straight to their status page.
 */
export type NextStep = {
  kind: "register" | "login" | "status";
  href: string;
};

/** Stripe Checkout Session ids: `cs_test_…` / `cs_live_…`. */
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

/** Rejects junk before it costs a Stripe API call. */
export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID_PATTERN.test(value);
}

export function nextStepFor(args: {
  submissionId: string;
  /** submissions.user_id — null until an anonymous payer claims the idea. */
  ownerId: string | null;
  claimToken: string | null;
  /** The signed-in visitor, if any. */
  viewerId: string | null;
}): NextStep {
  const statusPath = `/status/${args.submissionId}`;

  // Paid anonymously and not claimed yet: finishing the account is the step.
  if (!args.ownerId && args.claimToken) {
    return { kind: "register", href: `/register?claim=${encodeURIComponent(args.claimToken)}` };
  }

  if (args.ownerId && args.viewerId === args.ownerId) {
    return { kind: "status", href: statusPath };
  }

  // Owned by an account that isn't signed in on this device (or a different
  // account is). /status is auth-gated, so go through login with it attached.
  return {
    kind: "login",
    href: `/login?next=${encodeURIComponent(statusPath)}&notice=paid`,
  };
}
