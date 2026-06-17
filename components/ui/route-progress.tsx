"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Global page-navigation loader — an nprogress-style bar pinned to the very top
 * of the viewport. App Router gives no "navigation started" hook, so we infer it:
 *   • start  → a same-origin link click (covers every <Link>) or a back/forward
 *   • finish → the committed route actually changes (pathname/search effect)
 * The bar trickles toward 90% while in flight, then snaps to 100% and fades.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();

  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);

  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const fade = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  const clearTimers = () => {
    if (trickle.current) clearInterval(trickle.current);
    if (fade.current) clearTimeout(fade.current);
    if (safety.current) clearTimeout(safety.current);
    trickle.current = fade.current = safety.current = null;
  };

  const start = useCallback(() => {
    clearTimers();
    setActive(true);
    setValue(0.08);
    // Ease up to a near-complete crawl so the bar always shows motion.
    trickle.current = setInterval(() => {
      setValue((v) => (v >= 0.9 ? v : v + (0.9 - v) * 0.16));
    }, 350);
    // Never strand the bar if a same-page click yields no route change.
    safety.current = setTimeout(() => finish(), 8000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setValue(1);
    fade.current = setTimeout(() => {
      setActive(false);
      setValue(0);
    }, 300);
  }, []);

  // Completion: the new route has committed.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  // Start the bar on any genuine same-origin navigation intent.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Pure same-URL or hash-only jumps don't trigger a route change.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    const onPopState = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, [start]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: active ? 1 : 0, transition: "opacity 0.3s var(--ease-out)" }}
    >
      <div
        className="relative h-full rounded-r-full bg-gradient-to-r from-gold to-gold-bright shadow-[0_0_8px_rgba(228,196,90,0.7)]"
        style={{
          width: `${value * 100}%`,
          transition: "width 0.2s var(--ease-out)",
        }}
      >
        {/* Comet tip — the glowing leading edge. */}
        <span className="absolute right-0 top-1/2 h-3 w-16 -translate-y-1/2 translate-x-2 rounded-full bg-gold-bright opacity-70 blur-[5px]" />
      </div>
    </div>
  );
}
