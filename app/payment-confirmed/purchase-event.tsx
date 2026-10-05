"use client";

import { useEffect } from "react";

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/**
 * Tells Google Tag Manager about the sale as a standard GA4 `purchase` event,
 * so the Meta Pixel tag can fire Purchase with the real value and currency.
 *
 * Only rendered after the page has verified the payment with Stripe, and sent
 * once per Checkout Session per browser, so a reload or a return visit to the
 * receipt doesn't count a second sale. A URL-based trigger can't do either.
 */
export function PurchaseEvent({
  transactionId,
  value,
  currency,
  itemName,
}: {
  transactionId: string;
  value: number;
  currency: string;
  /** Passed in rather than imported: lib/stripe/checkout pulls in the Stripe SDK. */
  itemName: string;
}) {
  useEffect(() => {
    const key = `purchase-sent:${transactionId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still report the sale; a reload may report it again.
    }

    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    // Clear any previous ecommerce object, as Google's GA4 guidance requires.
    w.dataLayer.push({ ecommerce: null });
    w.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: transactionId,
        value,
        currency,
        items: [
          {
            item_id: "ai-invention-evaluation",
            item_name: itemName,
            price: value,
            quantity: 1,
          },
        ],
      },
    });
  }, [transactionId, value, currency, itemName]);

  return null;
}
