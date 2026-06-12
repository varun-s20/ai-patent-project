import Link from "next/link";
import { CtaLink } from "@/components/ui/button";

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
              <span
                className="block h-3 w-3 rounded-[3px] bg-gold ring-1 ring-gold-bright/60"
                style={{ transform: "rotate(45deg)" }}
              />
              <span className="font-display text-lg tracking-tight text-ink">
                AI Invention Registry
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Know whether your idea is worth patenting before you spend a dollar filing. A
              five-dimension AI evaluation, an 8-section report, and a timestamped certificate
              of registration.
            </p>
            <div className="mt-6">
              <CtaLink href="/submit">Evaluate My Idea for $49</CtaLink>
            </div>
          </div>

          {/* Nav columns. */}
          <div className="grid grid-cols-2 gap-8 text-sm sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted/70">
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
          <p className="max-w-2xl text-xs leading-relaxed text-muted">
            These are AI-generated estimates, not legal advice. This service confers no
            intellectual-property rights and is not a substitute for a registered patent
            attorney.
          </p>
          <p className="mt-3 text-xs text-muted/70">© 2026 AI Invention Registry</p>
        </div>
      </div>
    </footer>
  );
}
