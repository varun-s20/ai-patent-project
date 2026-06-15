import { CtaLink, buttonClasses } from "@/components/ui/button";
import { Seal, ShieldCheck } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";
import { AnimatedBar } from "@/components/motion/animated-bar";
import { ScoreRing } from "@/components/motion/score-ring";

// Scored on the live evaluation card (right tile).
const DIMENSIONS = [
  { name: "Novelty", score: 78 },
  { name: "Commercial", score: 74 },
  { name: "Defensibility", score: 68 },
  { name: "Licensing", score: 71 },
  { name: "Timing", score: 88 },
];

// The full set of areas each evaluation covers — the dark list panel (left tile),
// in the cadence of the reference's "What We Deliver" card.
const EVAL_AREAS = [
  "Novelty",
  "Commercial potential",
  "Defensibility",
  "Licensing probability",
  "Timing",
  "Competition & copy risk",
  "Final verdict & next step",
];

export function Hero() {
  // The TopCta band above fills the area behind the fixed nav, so the hero flows
  // normally beneath it. It's the page's dominant first section — generous vertical
  // space lets the masthead carry the most weight.
  return (
    <section className="section-tint overflow-x-clip">
      <div className="mx-auto w-full max-w-[1500px] px-6 pt-16 pb-24 sm:px-10 lg:px-16 lg:pt-24 lg:pb-36">
      {/* Row 1 — the value-prop masthead on the left, with the official
          registration seal set into the open space on the right (the product
          issues a timestamped record with every evaluation, so the seal earns its
          place). The seal is decorative on small screens and hides below lg. */}
      <div className="grid items-center gap-12 lg:grid-cols-[1.55fr_0.45fr]">
        <div>
          <InView>
            <h1 className="max-w-3xl pb-2 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Got a great idea worth protecting? Save thousands{" "}
              <span className="italic text-foil">before you file.</span>
            </h1>
          </InView>

          <InView delay={0.1}>
            <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-ink-2 sm:text-base">
              An attorney would charge up to{" "}
              <span className="text-ink">$10,000</span> to evaluate your idea, write an
              8-section intelligence report, and issue a timestamped certificate of
              registration. We think <span className="text-ink">$49</span> is all it should
              cost. Find out whether it&apos;s worth protecting first, then we&apos;ll
              point you to the right attorney.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href="/submit">Evaluate My Idea for $49</CtaLink>
              <a href="#how" className={buttonClasses("ghost")}>
                See how it works
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
              Private by default. We only share if you ask us to.
            </p>
          </InView>
        </div>

        <InView delay={0.15} className="hidden lg:flex lg:justify-center">
          <div className="flex flex-col items-center text-center">
            <RegistryStamp className="h-40 w-40 xl:h-44 xl:w-44" />
            <p className="mt-4 max-w-[20ch] text-[11px] leading-snug text-muted">
              Issued with every evaluation. Your idea, on record.
            </p>
          </div>
        </InView>
      </div>

      {/* Row 2 — the reference's two-card row: dark list panel + a large visual.
          The visual is our real product UI (a live evaluation), not a photo. */}
      <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[0.78fr_1.22fr]">
        {/* Left: navy "What we evaluate" panel. */}
        <InView>
          <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-b from-navy-800 to-navy-900 p-7 text-cream ring-1 ring-ink/20 shadow-[0_24px_60px_-30px_rgba(26,43,74,0.6)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.14),transparent)]"
            />
            <div className="relative flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.22em] text-cream/50">
                What we evaluate
              </p>
              <Seal className="h-4 w-4 text-gold-bright" />
            </div>
            <ul className="relative mt-5 flex-1 text-sm text-cream/85">
              {EVAL_AREAS.map((a) => (
                <li
                  key={a}
                  className="flex items-center gap-3 border-t border-white/[0.08] py-[0.7rem] first:border-t-0 first:pt-0"
                >
                  <span
                    aria-hidden
                    className="block h-2 w-2 shrink-0 rounded-[2px] bg-gold ring-1 ring-gold-bright/50"
                    style={{ transform: "rotate(45deg)" }}
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </InView>

        {/* Right: a live evaluation card — real scoring UI, not a mockup. */}
        <InView delay={0.1} className="relative">
          <div className="h-full">
            <div className="flex h-full flex-col justify-between gap-8 rounded-xl bg-card/95 p-6 ring-1 ring-ink/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_30px_70px_-32px_rgba(26,43,74,0.5)] backdrop-blur-sm sm:p-8">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      Sample evaluation
                    </p>
                    <p className="mt-1 font-display text-xl tracking-tight text-ink">
                      Self-cooling water bottle
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <Seal className="h-3.5 w-3.5" />
                    Proceed now
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-6">
                  <ScoreRing value={76} delay={0.25} />
                  <div className="flex-1 space-y-2.5">
                    {DIMENSIONS.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <span className="w-24 text-xs text-muted">{d.name}</span>
                        <AnimatedBar value={d.score} delay={0.3 + i * 0.08} className="flex-1" />
                        <span className="w-6 text-right text-xs font-medium text-ink">
                          <CountUp to={d.score} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line bg-paper/60 px-4 py-3">
                <span className="font-mono text-xs text-muted">GC-AI-2026-7F3A19</span>
                <span className="text-[11px] uppercase tracking-[0.15em] text-gold">
                  Timestamped
                </span>
              </div>
            </div>
          </div>
        </InView>
      </div>
      </div>
    </section>
  );
}

/**
 * The official registration seal. Reads like a notary/registry impression: a
 * clean double-rule rim carries two upright curved legends ("REGISTERED INVENTION
 * RECORD" / "TIMESTAMPED · CONFIDENTIAL"), and the center is a single, instantly
 * legible shield-and-check — the universal "protected & verified" mark — rather
 * than a busy sparkle. Navy ink with a gold check, on brand. One emblem, no
 * clutter, so the seal stays clear at small sizes.
 */
function RegistryStamp({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ filter: "drop-shadow(0 1px 1px rgba(26,43,74,0.18))" }}
      role="img"
      aria-label="Registered invention record, timestamped and confidential"
    >
      <defs>
        {/* Upper arc (left to right over the top) and lower arc (left to right
            under the bottom) so both legends sit upright and read naturally. */}
        <path id="stampTop" d="M 30 100 A 70 70 0 0 1 170 100" fill="none" />
        <path id="stampBottom" d="M 163 100 A 63 63 0 0 1 37 100" fill="none" />
      </defs>

      {/* Rim: a bold outer rule + two fine companion rules frame the legend band
          and the center, giving the engraved, official-document feel. */}
      <g className="text-navy-900" fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="96" strokeWidth="1" opacity="0.4" />
        <circle cx="100" cy="100" r="91" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="53" strokeWidth="1" opacity="0.4" />
      </g>

      {/* Curved legends — generous tracking keeps them crisp at small sizes. */}
      <g
        className="text-navy-900"
        fill="currentColor"
        stroke="none"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <text fontSize="12.5" fontWeight="600" letterSpacing="1.8">
          <textPath href="#stampTop" startOffset="50%" textAnchor="middle">
            REGISTERED INVENTION RECORD
          </textPath>
        </text>
        <text fontSize="10.5" fontWeight="500" letterSpacing="2.2">
          <textPath href="#stampBottom" startOffset="50%" textAnchor="middle">
            TIMESTAMPED · CONFIDENTIAL
          </textPath>
        </text>
      </g>

      {/* Gold diamond separators where the two legends meet (9 and 3 o'clock). */}
      <g className="text-gold" fill="currentColor" stroke="none">
        <path d="M20 100l4-4 4 4-4 4z" />
        <path d="M172 100l4-4 4 4-4 4z" />
      </g>

      {/* Center emblem — shield (navy) with a check (gold): protected + verified. */}
      <g transform="translate(100 98)">
        <path
          className="text-navy-900"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          d="M0 -34 L28 -23 V2 C28 21 16 33 0 40 C-16 33 -28 21 -28 2 V-23 Z"
        />
        <path
          className="text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M-13 0 L-4 10 L14 -12"
        />
      </g>
    </svg>
  );
}
