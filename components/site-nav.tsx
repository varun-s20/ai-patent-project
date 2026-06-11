"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { CtaLink } from "@/components/ui/button";

export function SiteNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = authed
    ? [{ href: "/dashboard", label: "Dashboard" }]
    : [
        { href: "/#how", label: "How it works" },
        { href: "/#pricing", label: "Pricing" },
      ];

  const close = () => setOpen(false);

  return (
    <>
      {/* Floating glass pill — detached from the top edge. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <nav className="pointer-events-auto mt-5 flex w-full max-w-2xl items-center justify-between gap-2 rounded-full border border-ink/10 bg-cream/70 py-2 pl-5 pr-2 shadow-[0_8px_30px_rgba(20,25,40,0.07)] backdrop-blur-xl">
          <Link href="/" onClick={close} className="group flex items-center gap-2.5">
            <span
              className="block h-3 w-3 rounded-[3px] bg-gold ring-1 ring-gold-bright/60 transition-transform duration-500 ease-[var(--ease-out)] group-hover:rotate-[135deg]"
              style={{ transform: "rotate(45deg)" }}
            />
            <span className="text-[13px] font-medium tracking-tight text-ink">
              AI Invention Registry
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-[13px] text-ink-2 transition-colors duration-200 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            {authed ? (
              <form action={signOut}>
                <button className="rounded-full px-3 py-1.5 text-[13px] text-ink-2 transition-colors duration-200 hover:text-ink">
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-[13px] text-ink-2 transition-colors duration-200 hover:text-ink"
              >
                Log in
              </Link>
            )}
            <CtaLink href="/submit" className="ml-1">
              Evaluate — $49
            </CtaLink>
          </div>

          {/* Hamburger → X morph */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.05] active:scale-95 md:hidden"
          >
            <span
              className={`absolute h-px w-4 bg-ink transition-transform duration-300 ease-[var(--ease-out)] ${
                open ? "rotate-45" : "-translate-y-[3px]"
              }`}
            />
            <span
              className={`absolute h-px w-4 bg-ink transition-transform duration-300 ease-[var(--ease-out)] ${
                open ? "-rotate-45" : "translate-y-[3px]"
              }`}
            />
          </button>
        </nav>
      </div>

      {/* Full-screen glass overlay with staggered mask reveal. */}
      <div
        className={`fixed inset-0 z-30 flex flex-col bg-cream/90 backdrop-blur-2xl transition-opacity duration-500 ease-[var(--ease-out)] md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mt-28 flex flex-col gap-2 px-8">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              style={{ transitionDelay: `${open ? 120 + i * 60 : 0}ms` }}
              className={`font-display text-4xl tracking-tight text-ink transition-all duration-500 ease-[var(--ease-out)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {authed ? (
            <form action={signOut} onSubmit={close}>
              <button
                style={{ transitionDelay: `${open ? 120 + links.length * 60 : 0}ms` }}
                className={`font-display text-4xl tracking-tight text-ink transition-all duration-500 ease-[var(--ease-out)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              onClick={close}
              style={{ transitionDelay: `${open ? 120 + links.length * 60 : 0}ms` }}
              className={`font-display text-4xl tracking-tight text-ink transition-all duration-500 ease-[var(--ease-out)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              Log in
            </Link>
          )}
          <div
            style={{ transitionDelay: `${open ? 160 + (links.length + 1) * 60 : 0}ms` }}
            className={`mt-6 transition-all duration-500 ease-[var(--ease-out)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <CtaLink href="/submit">Evaluate — $49</CtaLink>
          </div>
        </div>
      </div>
    </>
  );
}
