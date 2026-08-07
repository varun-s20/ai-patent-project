"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-checks a submission that's mid-flight, and — crucially — GIVES UP.
 *
 * This replaces a bare `<meta http-equiv="refresh" content="5">`, which had no
 * end condition. The Stripe webhook is the only thing in the app that moves a
 * row off `draft` (app/api/stripe/webhook/route.ts), so if it never lands the
 * row never changes and that meta tag reloaded "Confirming your payment…"
 * every five seconds forever, for a customer who had already been charged.
 *
 * After `timeoutMs` this stops polling and says so, with the submission id to
 * quote to support. A wrong answer the user can act on beats a spinner.
 */
export function StatusPoller({
  timeoutMs,
  message,
  intervalMs = 5000,
}: {
  timeoutMs: number;
  message: string;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    // router.refresh() re-runs the server component in place, so this
    // component is never remounted by its own polling and `startedAt`
    // survives every refresh. A full reload would reset it and never expire.
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt >= timeoutMs) {
        setStalled(true);
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, timeoutMs, intervalMs]);

  if (!stalled) return null;

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      {message}
    </div>
  );
}
