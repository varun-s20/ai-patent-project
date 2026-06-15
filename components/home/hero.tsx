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

// The full set of areas each evaluation covers — the dark list panel (left tile).
const EVAL_AREAS = [
  "Novelty",
  "Commercial potential",
  "Defensibility",
  "Licensing probability",
  "Timing",
  "Competition and copy risk",
  "Final verdict and next step",
];

export function Hero() {
  return (
    <section className="section-tint overflow-x-clip">
      <div className="mx-auto w-full max-w-[1500px] px-6 pt-12 pb-24 sm:px-10 lg:px-16 lg:pt-16 lg:pb-32">
        {/* Masthead — left-aligned value prop, generous breathing room, the
            primary action visible before any scroll. */}
        <div className="max-w-5xl">
          <InView>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Got a great idea worth protecting? Save thousands before you file.
            </h1>
          </InView>

          <InView delay={0.1}>
            <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-ink-2 sm:text-lg">
              A patent attorney charges up to <span className="text-ink">$10,000</span> to
              evaluate an idea and certify it. We do the same five-dimension read, report,
              and timestamped record for <span className="text-ink">$49</span>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CtaLink href="/submit">Evaluate for $49</CtaLink>
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

        {/* Product visual — a navy "what we evaluate" panel beside the real
            scoring UI (a live evaluation), framed like the reference's product
            shots rather than a stock photo. */}
        <div className="mt-14 grid gap-4 lg:mt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <InView>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-7 text-cream ring-1 ring-ink/20 shadow-[0_24px_60px_-30px_rgba(26,43,74,0.6)]">
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

          <InView delay={0.1} className="relative">
            <div className="h-full">
              <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-card/95 p-6 ring-1 ring-ink/[0.07] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_30px_70px_-32px_rgba(26,43,74,0.5)] backdrop-blur-sm sm:p-8">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                        Sample evaluation
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">
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
