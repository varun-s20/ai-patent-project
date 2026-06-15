import { CtaLink } from "@/components/ui/button";

/**
 * The headline CTA, lifted to the very top of the page (client request). It fills
 * the band behind the translucent nav with the brand navy — so the header reads as
 * one dark masthead zone — then states the promise as a large, attention-first
 * statement before offering the action.
 */
export function TopCta() {
  return (
    <section className="relative isolate -mt-24 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-cream">
      {/* Warm bloom rising under the nav, plus a hairline base highlight. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(55%_120%_at_50%_0%,rgba(228,196,90,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
      />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col items-start gap-8 px-6 pb-12 pt-32 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-16 lg:pb-14 lg:pt-36">
        <p className="max-w-3xl font-display text-3xl font-medium leading-[1.12] tracking-tight text-cream sm:text-4xl lg:text-5xl">
          Your next BIG idea deserves a second opinion, and{" "}
          <span className="italic text-foil">protection today.</span>
        </p>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 lg:shrink-0 lg:pb-1">
          <span className="max-w-[24ch] text-sm leading-snug text-cream/60">
            Five minutes to know whether to file, refine, or walk away.
          </span>
          <CtaLink href="/submit" variant="gold">
            Evaluate for $49
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
