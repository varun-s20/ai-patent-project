// lib/admin/revenue.ts
/** Flat one-time price per evaluation, in whole dollars. */
export const UNIT_PRICE = 49;

/** Statuses that mean Stripe collected a payment (everything past draft). */
export const PAID_STATUSES = ["paid", "processing", "complete", "refunded", "failed"] as const;

export type RevenueInput = { paidCount: number; refundedCount: number };
export type Revenue = {
  gross: number;
  refunds: number;
  net: number;
  paidCount: number;
  refundedCount: number;
};

export function computeRevenue({ paidCount, refundedCount }: RevenueInput): Revenue {
  const gross = paidCount * UNIT_PRICE;
  const refunds = refundedCount * UNIT_PRICE;
  return { gross, refunds, net: gross - refunds, paidCount, refundedCount };
}
