import { CtaLink, buttonClasses } from "@/components/ui/button";
import { Seal } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";
import { AnimatedBar } from "@/components/motion/animated-bar";

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
  // -mt-24 cancels the layout's global pt-24 so the tint fills up behind the fixed
  // nav (no bare paper-grey strip); the inner pt restores the content position.
  return (
    <section className="section-tint -mt-24 overflow-x-clip">
      <div className="mx-auto w-full max-w-[1500px] px-6 pt-36 pb-20 sm:px-10 lg:px-16 lg:pt-40 lg:pb-28">
      {/* Row 1 — headline left, supporting copy and CTAs right. */}
      <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <InView>
          <h1 className="max-w-2xl pb-1.5 font-display text-5xl font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Save thousands{" "}
            <span className="italic text-foil">before you file.</span>
          </h1>
        </InView>

        <InView delay={0.1} className="lg:pb-3">
          <p className="max-w-md text-[15px] leading-relaxed text-ink-2 sm:text-base">
            An AI evaluation, an 8-section intelligence report, and a timestamped
            certificate of registration. <span className="text-ink">$49</span>, not the
            $2,000 to $10,000 an attorney charges.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CtaLink href="/submit">Evaluate My Idea for $49</CtaLink>
            <a href="#how" className={buttonClasses("ghost")}>
              See how it works
            </a>
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
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(200,160,32,0.16),transparent)] blur-2xl"
          />
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
                  <ScoreRing value={76} />
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

/** Conic-gradient score ring with an animated numeric core. */
function ScoreRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold) ${value * 3.6}deg, rgba(26,43,74,0.07) 0deg)`,
      }}
    >
      <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-card">
        <span className="font-display text-2xl text-ink">
          <CountUp to={value} />
        </span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted">Overall</span>
      </div>
    </div>
  );
}
