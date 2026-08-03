"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Routes that render their own complete chrome and must not get the site's.
 * The admin console is a self-contained dashboard shell (its own sidebar + top
 * bar). The paid-traffic landing page ships a slim logo bar and a two-line
 * footer on purpose: site nav on an ad landing page is a row of exits from a
 * click we paid for.
 */
const BARE_ROUTES = ["/admin", "/patent-idea-check"];

/**
 * Picks the page chrome by route. Bare routes drop the marketing header,
 * footer, and atmospheric background — everything else keeps the full site
 * chrome.
 */
export function ChromeGate({
  atmosphere,
  header,
  footer,
  children,
}: {
  atmosphere: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isBare = BARE_ROUTES.some((route) => pathname?.startsWith(route)) ?? false;

  if (isBare) return <>{children}</>;

  return (
    <>
      {atmosphere}
      {header}
      <div className="flex flex-1 flex-col pt-24">{children}</div>
      {footer}
    </>
  );
}
