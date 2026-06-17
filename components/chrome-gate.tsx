"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Picks the page chrome by route. The admin console is a self-contained dashboard
 * shell (its own sidebar + top bar) so it drops the marketing header, footer, and
 * atmospheric background — everything else keeps the full site chrome.
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
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {atmosphere}
      {header}
      <div className="flex flex-1 flex-col pt-24">{children}</div>
      {footer}
    </>
  );
}
