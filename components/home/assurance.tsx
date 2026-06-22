import { ShieldCheck, Clock, Check } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";

// The privacy promises we can stand behind honestly — no fabricated guarantees.
const GUARANTEES = [
  "Never shared with third parties",
  "You keep 100% ownership",
  "Encrypted & access-controlled",
];

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
          <div className="hover-lift relative flex flex-col rounded-2xl border border-line bg-card p-8 shadow-[0_30px_70px_-50px_rgba(26,43,74,0.4)] hover:shadow-[0_42px_84px_-48px_rgba(26,43,74,0.5)] sm:p-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/[0.12] ring-1 ring-gold/25">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
              Private &amp; confidential
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Your idea is yours. We won&apos;t take it.
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2">
              Your submission is totally private and confidential. We never share it
              with anyone — if you decide to file, we forward your report only to an
              attorney <span className="text-ink">you</span> choose, and only with your
              say-so.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {GUARANTEES.map((g) => (
                <li
                  key={g}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/60 px-3 py-1.5 text-[12px] font-medium text-ink-2"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          {/* The cost of waiting. */}
          <div className="hover-lift relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-cream ring-1 ring-ink/20 shadow-[0_30px_70px_-40px_rgba(13,22,38,0.85)] sm:p-10">
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
            <p className="relative mt-4 max-w-xl text-base leading-relaxed text-cream/75">
              IP theft costs the U.S. an estimated{" "}
              <span className="text-gold-bright">$225 to $600 billion</span> a year, yet only
              about <span className="text-cream">1 in 10</span> inventors take even the first
              step to protect an idea. A timestamped registration is proof of who had it
              first.
            </p>
            <p className="relative mt-5 text-[11px] leading-relaxed text-cream/60">
              Sources: U.S. IP Commission estimate; FindLaw inventor survey.
            </p>
          </div>
        </div>
      </InView>
    </section>
  );
}
