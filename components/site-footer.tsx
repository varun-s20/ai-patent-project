import Link from "next/link";
import { CtaLink } from "@/components/ui/button";
import { Patent } from "@/components/ui/icons";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/submit", label: "Evaluate an idea" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/", label: "Home" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Brand block with an action slot — the reference's footer CTA area. */}
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              {/* Same machined gold-foil patent medallion as the navbar logo. */}
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold-bright/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_1px_2px_rgba(120,90,20,0.28)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/25 to-transparent"
                />
                <Patent className="relative h-[18px] w-[18px] text-navy-900" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                AI Invention Registry
              </span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Know whether your idea is worth patenting before you spend a dollar filing. A
              five-dimension AI evaluation, an 8-section report, and a timestamped certificate
              of registration.
            </p>
            <div className="mt-6">
              <CtaLink href="/submit">Evaluate for $49</CtaLink>
            </div>
          </div>

          {/* Nav columns. */}
          <div className="grid grid-cols-2 gap-8 text-[15px] sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted/70">
                  {col.heading}
                </p>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-ink-2 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <p className="text-[13px] leading-relaxed text-muted">
            These are AI-generated estimates, not legal advice. This service confers no
            intellectual-property rights and is not a substitute for a registered patent
            attorney.
          </p>
          <p className="mt-3 text-[13px] text-muted/70">© 2026 AI Invention Registry</p>
        </div>
      </div>
    </footer>
  );
}
