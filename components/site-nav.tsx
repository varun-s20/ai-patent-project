"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { signOut } from "@/app/auth/actions";
import { ArrowUpRight, Patent } from "@/components/ui/icons";

type NavLink = { href: string; label: string; desc: string };

const EASE = [0.32, 0.72, 0, 1] as const;

export function SiteNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [vw, setVw] = useState(1280);
  const reduce = useReducedMotion();
  const pathname = usePathname();

  // One state flip at the threshold drives the whole expand→collapse transition.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (yv) => {
    const next = yv > 16;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  // Track viewport width so the collapsed island can shrink to a centered pill
  // (full-bleed at the top → fixed-width island on scroll) with px-smooth motion.
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links: NavLink[] = authed
    ? [
        { href: "/#how", label: "How it works", desc: "From an idea to a verifiable record" },
        { href: "/dashboard", label: "Dashboard", desc: "Your evaluations & certificates" },
      ]
    : [{ href: "/#how", label: "How it works", desc: "From an idea to a verifiable record" }];

  const close = () => setOpen(false);

  const isActive = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  const activeKey = links.find((l) => isActive(l.href))?.href ?? null;
  const shown = hovered ?? activeKey;

  const indicator = (key: string) =>
    shown === key ? (
      <motion.span
        layoutId="navHover"
        className="absolute inset-0 -z-10 rounded-md bg-ink/[0.05] ring-1 ring-ink/[0.05]"
        transition={
          reduce ? { duration: 0 } : { type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] }
        }
      />
    ) : null;

  const itemClass =
    "relative rounded-md px-4 py-2 text-[13px] text-ink-2 transition-colors duration-200 hover:text-ink";

  // Collapsed island is wider when logged in (more entries) so the row breathes;
  // it never exceeds the viewport (insets ~12px each side on phones).
  const collapsedWidth = Math.min(authed ? 820 : 660, vw - 24);
  const geometry = {
    maxWidth: scrolled ? collapsedWidth : vw,
    marginTop: scrolled ? 12 : 0,
    borderRadius: scrolled ? 16 : 0,
  };

  return (
    <>
      {/* Expands edge-to-edge at the top; collapses to a centered glass island on scroll. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <motion.nav
          onMouseLeave={() => setHovered(null)}
          initial={false}
          animate={geometry}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE }}
          className={`group/nav pointer-events-auto relative mx-auto flex w-full items-center backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-500 ease-[var(--ease-out)] ${
            scrolled
              ? "border border-ink/10 bg-cream/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_50px_-12px_rgba(20,25,40,0.18)]"
              : "border-b border-line bg-cream/70 shadow-[0_1px_0_rgba(20,25,40,0.03)]"
          }`}
        >
          {/* Gold hairline along the top edge — ignites only once collapsed. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-8 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-gold/50 to-transparent transition-opacity duration-500 ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Inner rail — aligns with the page's content gutters when expanded,
              tightens to a pill when collapsed. */}
          <div
            className={`mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 transition-[padding] duration-500 ease-[var(--ease-out)] ${
              scrolled ? "px-1.5 py-1.5" : "px-5 py-3.5 sm:px-10 lg:px-16"
            }`}
          >
            <Link
              href="/"
              onClick={close}
              onMouseEnter={() => setHovered("logo")}
              className="group relative flex items-center gap-2.5 rounded-md py-1 pl-1.5 pr-3"
            >
              {indicator("logo")}
              {/* Machined gold-foil tile carrying the patent medallion. */}
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_1px_2px_rgba(120,90,20,0.28)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/25 to-transparent"
                />
                <Patent className="relative h-[18px] w-[18px] text-navy-900" />
              </span>
              <span className="text-[13px] font-medium tracking-tight text-ink">
                AI Invention Registry
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={itemClass}
                >
                  {indicator(l.href)}
                  {l.label}
                </Link>
              ))}
              {authed ? (
                <form action={signOut}>
                  <button
                    onMouseEnter={() => setHovered("auth")}
                    className={itemClass}
                    type="submit"
                  >
                    {indicator("auth")}
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onMouseEnter={() => setHovered("auth")}
                  aria-current={isActive("/login") ? "page" : undefined}
                  className={itemClass}
                >
                  {indicator("auth")}
                  Log in
                </Link>
              )}

              <span aria-hidden className="mx-1.5 h-5 w-px bg-ink/10" />

              <Link
                href="/submit"
                className="group/cta inline-flex select-none items-center gap-2 rounded-lg bg-ink py-2 pl-5 pr-2 text-[13px] font-medium tracking-tight text-cream shadow-[0_1px_2px_rgba(20,25,40,0.22)] transition-colors duration-200 ease-[var(--ease-out)] hover:bg-navy-800"
              >
                <span>Evaluate for $49</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cream/15 transition-transform duration-300 ease-[var(--ease-out)] group-hover/cta:translate-x-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>

            {/* Hamburger → X morph (mobile). */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-ink/[0.05] md:hidden"
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
          </div>
        </motion.nav>
      </div>

      {/* Full-screen glass overlay with staggered reveal (mobile). */}
      <div
        className={`fixed inset-0 z-30 flex flex-col bg-cream/90 backdrop-blur-2xl transition-opacity duration-500 ease-[var(--ease-out)] md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mt-28 flex flex-col px-8">
          {links.map((l, i) => (
            <MobileRow
              key={l.href}
              href={l.href}
              label={l.label}
              desc={l.desc}
              onClick={close}
              open={open}
              delay={120 + i * 60}
            />
          ))}
          {authed ? (
            <form action={signOut} onSubmit={close}>
              <MobileRow
                as="button"
                label="Sign out"
                desc="End your session on this device"
                open={open}
                delay={120 + links.length * 60}
              />
            </form>
          ) : (
            <MobileRow
              href="/login"
              label="Log in"
              desc="Access your account & records"
              onClick={close}
              open={open}
              delay={120 + links.length * 60}
            />
          )}

          <div
            style={{ transitionDelay: `${open ? 160 + (links.length + 1) * 60 : 0}ms` }}
            className={`mt-8 transition-all duration-500 ease-[var(--ease-out)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <Link
              href="/submit"
              onClick={close}
              className="group/cta inline-flex select-none items-center gap-2 rounded-lg bg-ink py-3 pl-6 pr-2.5 text-sm font-medium tracking-tight text-cream shadow-[0_1px_2px_rgba(20,25,40,0.22)] transition-colors duration-200 ease-[var(--ease-out)]"
            >
              <span>Evaluate for $49</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cream/15 transition-transform duration-300 ease-[var(--ease-out)] group-hover/cta:translate-x-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        <div
          style={{ transitionDelay: `${open ? 220 + (links.length + 1) * 60 : 0}ms` }}
          className={`mt-auto flex items-center gap-2.5 px-8 pb-10 text-xs text-muted transition-all duration-500 ease-[var(--ease-out)] ${
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <Patent className="h-3.5 w-3.5 text-gold" />
          <span>One flat $49 — report and certificate, on record. Refund-backed.</span>
        </div>
      </div>
    </>
  );
}

/** A single full-screen-menu destination: display title, sub-label, trailing arrow. */
function MobileRow({
  href,
  label,
  desc,
  onClick,
  open,
  delay,
  as = "link",
}: {
  href?: string;
  label: string;
  desc: string;
  onClick?: () => void;
  open: boolean;
  delay: number;
  as?: "link" | "button";
}) {
  const inner = (
    <>
      <span className="min-w-0">
        <span className="block font-display text-[2rem] leading-none tracking-tight text-ink">
          {label}
        </span>
        <span className="mt-2 block text-sm text-muted">{desc}</span>
      </span>
      <ArrowUpRight className="mb-1 h-5 w-5 shrink-0 text-muted transition-transform duration-300 ease-[var(--ease-out)] group-hover/row:translate-x-0.5" />
    </>
  );
  const cls = `group/row flex items-end justify-between gap-6 border-t border-ink/[0.08] py-5 transition-all duration-500 ease-[var(--ease-out)] ${
    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
  }`;
  const style = { transitionDelay: `${open ? delay : 0}ms` };

  return as === "button" ? (
    <button type="submit" style={style} className={`${cls} w-full text-left`}>
      {inner}
    </button>
  ) : (
    <Link href={href!} onClick={onClick} style={style} className={cls}>
      {inner}
    </Link>
  );
}
