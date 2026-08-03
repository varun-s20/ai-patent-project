"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hidden field carrying the page the admin acted from, so the action can
 * redirect back to exactly this view (filters, sort and page intact) with its
 * result banner. Server actions cannot read the current URL themselves.
 */
export function ReturnTo() {
  const pathname = usePathname();
  const params = useSearchParams();
  // The notice from a previous action must not be carried into the next one.
  const next = new URLSearchParams(params.toString());
  next.delete("notice");
  const query = next.toString();

  return <input type="hidden" name="returnTo" value={query ? `${pathname}?${query}` : pathname} />;
}
