import { ShieldCheck, Clock } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";

/**
 * Two paired assurances the client asked us to make explicit: (1) the idea stays
 * confidential and is only ever forwarded to an attorney the inventor chooses, and
 * (2) the real cost of leaving an idea unprotected — framed with sourced figures
 * rather than fabricated counts, so the trust signals stay honest.
 */
export function Assurance() {
  return (
    <section className="w-full px-4 py-12 sm:px-6">
      <InView>
        <div className="mx-auto grid w-full max-w-[1500px] gap-4 lg:grid-cols-2">
          {/* Confidentiality. */}
          <div className="relative flex flex-col rounded-2xl border border-line bg-card p-8 shadow-[0_30px_70px_-50px_rgba(26,43,74,0.4)] sm:p-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/[0.12] ring-1 ring-gold/25">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Your idea never leaves your hands.
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
              We don&apos;t share your submission with anyone. If you decide to file,
              we&apos;ll forward your report to the attorney of your choice, and only
              then, only with your say-so.
            </p>
          </div>

          {/* The cost of waiting. */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-cream ring-1 ring-ink/20 shadow-[0_30px_70px_-40px_rgba(13,22,38,0.85)] sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.14),transparent)]"
            />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 ring-1 ring-gold-bright/30">
              <Clock className="h-5 w-5 text-gold-bright" />
            </div>
            <h3 className="relative mt-6 font-display text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
              An unprotected idea has no record.
            </h3>
            <p className="relative mt-4 max-w-md text-[15px] leading-relaxed text-cream/75">
              IP theft costs the U.S. an estimated{" "}
              <span className="text-gold-bright">$225 to $600 billion</span> a year, yet only
              about <span className="text-cream">1 in 10</span> inventors take even the first
              step to protect an idea. A timestamped registration is proof of who had it
              first.
            </p>
            <p className="relative mt-5 text-[11px] leading-relaxed text-cream/40">
              Sources: U.S. IP Commission estimate; FindLaw inventor survey.
            </p>
          </div>
        </div>
      </InView>
    </section>
  );
}
