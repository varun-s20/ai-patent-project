/**
 * The $49 offer, in words, in one place.
 *
 * Three surfaces quote these now — the public form, the left column beside it,
 * and the legacy /pay card — and Stripe's own page says the same thing in prose
 * (PRODUCT_DESCRIPTION in lib/stripe/checkout.ts). A buyer who reads one
 * promise on our page and a different one on Stripe's trusts neither, so the
 * strings live here rather than being retyped per component.
 *
 * Both promises below are literally true and must stay that way:
 * Stripe hosts the card fields, so card numbers never reach our servers; and
 * evaluate-submission's onFailure really does refund once its retries are
 * exhausted. Terms clause 6 is the same promise in full. Do not soften either
 * into a vaguer "guarantee", and do not strengthen it into the change-of-mind
 * refund we don't offer.
 */
export const INCLUDED = [
  "Five-dimension AI evaluation — novelty, commercial potential, defensibility, licensing, timing",
  "8-section pre-patent intelligence report (PDF)",
  "Timestamped Certificate of Idea Registration",
  "Both delivered by email within minutes",
];

export const SECURE_LINE = "Secure payment by Stripe. We never see your card details.";

export const REFUND_LINE = "Full refund if we don't deliver your report.";
