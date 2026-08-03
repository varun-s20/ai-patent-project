import Link from "next/link";
import { ArrowUpRight, Patent, ShieldCheck } from "@/components/ui/icons";

/**
 * The landing funnel's own chrome, shared by the ad page and its thank-you page.
 * Deliberately not the site header/footer (see BARE_ROUTES in chrome-gate.tsx):
 * site navigation on a page we paid for the click on is a row of exits, so this
 * has none. The lockup isn't a link either, and the one action in here is the
 * conversion itself rather than a menu.
 *
 * Fully transparent: no fill, no hairline. It sits on the hero band's own
 * gradient so the page opens as a single surface.
 */
export function LandingHeader() {
  return (
    <header className="relative z-20 bg-transparent">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-bright to-gold ring-1 ring-gold/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <Patent className="h-[19px] w-[19px] text-navy-900" />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            AI Patent Register
          </span>
        </div>

        <div className="flex items-center gap-6">
          <p className="hidden items-center gap-2 text-[13px] text-muted lg:flex">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
            Private by default · No spam
          </p>
          {/* Byte-for-byte the sitewide nav CTA (see components/site-nav.tsx) so
              an ad visitor who already knows what they want isn't forced through
              the lead form, and the button they saw in the ad creative is the
              button they see here. Hidden on phones, where the sticky bottom bar
              already carries the action. */}
          <Link
            href="/submit"
            className="group/cta hidden shrink-0 select-none items-center gap-2 rounded-lg bg-ink py-2 pl-5 pr-2 text-[15px] font-medium tracking-tight text-cream shadow-[0_1px_2px_rgba(20,25,40,0.22)] transition-colors duration-200 ease-[var(--ease-out)] hover:bg-navy-800 sm:inline-flex"
          >
            <span>Evaluate for $49</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cream/15 transition-transform duration-300 ease-[var(--ease-out)] group-hover/cta:translate-x-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/** The legal minimum, and no wandering off. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-6 py-8 text-[12px] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <p>© {new Date().getFullYear()} AI Patent Register. All rights reserved.</p>
        <p className="max-w-[62ch]">
          AI-generated estimates, not legal advice. An evaluation confers no
          intellectual-property rights and is not a patent application.
        </p>
      </div>
    </footer>
  );
}
