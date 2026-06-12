import { CtaLink } from "@/components/ui/button";
import { InView } from "@/components/motion/in-view";

export function FinalCta() {
  return (
    <section className="px-4 pb-24 pt-6 sm:px-6">
      <InView className="mx-auto w-full max-w-[1500px]">
        {/* Near-edge navy band — the reference's closing CTA panel, brand-side. */}
        <div className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-20 ring-1 ring-ink/20 shadow-[0_40px_100px_-50px_rgba(13,22,38,0.85)] sm:px-12 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(228,196,90,0.18),transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
            <h2 className="pb-1 font-display text-4xl font-medium leading-[1.1] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              Your next idea deserves a{" "}
              <span className="italic text-foil">second opinion.</span>
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-cream/70">
              Five minutes and $49 to know whether to file, refine, or walk away.
            </p>
            <CtaLink href="/submit" variant="gold">
              Evaluate My Idea for $49
            </CtaLink>
          </div>
        </div>
      </InView>
    </section>
  );
}
