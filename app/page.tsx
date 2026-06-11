import { CtaLink, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { Check, Seal, Scale, ArrowUpRight } from "@/components/ui/icons";

const DIMENSIONS = [
  { name: "Novelty", score: 82 },
  { name: "Commercial", score: 74 },
  { name: "Defensibility", score: 68 },
  { name: "Licensing", score: 71 },
  { name: "Timing", score: 88 },
];

const STEPS = [
  {
    n: "01",
    title: "Describe your invention",
    body: "A short, guided form. Title, problem, and how it works — autosaved as you type.",
  },
  {
    n: "02",
    title: "AI evaluates five dimensions",
    body: "Novelty, commercial potential, defensibility, licensing, and timing — each scored and reasoned.",
  },
  {
    n: "03",
    title: "Receive report & certificate",
    body: "A pre-patent intelligence report and a timestamped certificate of registration, instantly.",
  },
];

export default function Home() {
  return (
    <main>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16 lg:pb-32">
        <Reveal>
          <Eyebrow>Est. 2026 — IP Intelligence</Eyebrow>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Know if your idea is worth{" "}
            <span className="italic text-gold">patenting.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
            A five-dimension AI evaluation, a pre-patent intelligence report, and a
            timestamped certificate of registration — for{" "}
            <span className="text-ink">$49</span>, not $10,000.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CtaLink href="/submit">Evaluate My Idea — $49</CtaLink>
            <a href="#how" className={buttonClasses("ghost")}>
              How it works
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Check className="h-4 w-4 text-gold" />
            No attorney bills. Results in minutes, not weeks.
          </p>
        </Reveal>

        {/* Sample verdict card — floating, slightly rotated (Z-axis cascade). */}
        <Reveal delay={120} className="lg:pl-6">
          <div className="relative md:rotate-[1.5deg]">
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    Sample evaluation
                  </p>
                  <p className="mt-1 font-display text-xl tracking-tight text-ink">
                    Self-cooling water bottle
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <Seal className="h-3.5 w-3.5" />
                  Proceed now
                </span>
              </div>

              <div className="mt-6 flex items-center gap-5">
                <ScoreRing value={77} />
                <div className="flex-1 space-y-2.5">
                  {DIMENSIONS.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-muted">{d.name}</span>
                      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-bright"
                          style={{ width: `${d.score}%` }}
                        />
                      </span>
                      <span className="w-6 text-right text-xs font-medium text-ink">
                        {d.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-paper/60 px-4 py-3">
                <span className="font-mono text-xs text-muted">GC-AI-2026-7F3A19</span>
                <span className="text-[11px] uppercase tracking-[0.15em] text-gold">
                  Timestamped
                </span>
              </div>
            </Card>
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── How it works ───────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
            From rough idea to defensible record in three steps.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <Card className="h-full">
                <span className="font-mono text-sm text-gold">{s.n}</span>
                <h3 className="mt-5 font-display text-2xl tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Value bento ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <Reveal className="md:col-span-2 md:row-span-2">
            <Card className="flex h-full flex-col justify-between">
              <div>
                <Eyebrow>The math</Eyebrow>
                <p className="mt-6 font-display text-6xl tracking-tight text-ink sm:text-7xl">
                  $49 <span className="text-2xl text-muted">vs.</span>{" "}
                  <span className="italic text-gold">$10,000</span>
                </p>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">
                  A patent attorney&apos;s patentability opinion runs five figures and takes
                  weeks. Get a rigorous first read in minutes — and only file when it&apos;s
                  worth it.
                </p>
              </div>
              <div className="mt-8">
                <CtaLink href="/submit" variant="gold">
                  Start your evaluation
                </CtaLink>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={90}>
            <Card className="h-full">
              <Scale className="h-6 w-6 text-gold" />
              <h3 className="mt-5 font-display text-2xl tracking-tight text-ink">
                Five dimensions
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Novelty, commercial potential, defensibility, licensing, and timing — each
                scored 0–100 with reasoning.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={150}>
            <Card className="h-full">
              <Seal className="h-6 w-6 text-gold" />
              <h3 className="mt-5 font-display text-2xl tracking-tight text-ink">
                A certificate, on record
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A timestamped, publicly verifiable certificate of idea registration with a
                unique ID and QR.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Pricing anchor ───────────────────────── */}
      <section id="pricing" className="mx-auto max-w-3xl px-6 py-24">
        <Reveal>
          <div className="rounded-[2.25rem] bg-ink p-1.5 ring-1 ring-ink/20">
            <div className="rounded-[1.875rem] bg-gradient-to-b from-ink to-[#0f1521] px-8 py-12 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <Eyebrow className="border-white/10 bg-white/[0.04] text-cream/70">
                One flat price
              </Eyebrow>
              <p className="mt-6 font-display text-7xl tracking-tight text-cream">$49</p>
              <p className="mt-3 text-cream/60">
                One evaluation. Full report. Certificate of registration.
              </p>
              <ul className="mx-auto mt-8 flex max-w-xs flex-col gap-3 text-left text-sm text-cream/80">
                {[
                  "Five-dimension AI scoring with rationale",
                  "8-section pre-patent intelligence report (PDF)",
                  "Timestamped, verifiable certificate",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex justify-center">
                <CtaLink href="/submit" variant="gold">
                  Evaluate My Idea
                </CtaLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-28 pt-8">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="max-w-2xl font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
              Your next idea deserves a{" "}
              <span className="italic text-gold">second opinion.</span>
            </h2>
            <a
              href="/submit"
              className="group inline-flex items-center gap-2 text-lg font-medium text-ink"
            >
              Evaluate it now
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

/** Conic-gradient score ring with a numeric core. */
function ScoreRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold) ${value * 3.6}deg, rgba(22,29,43,0.07) 0deg)`,
      }}
    >
      <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-card">
        <span className="font-display text-2xl text-ink">{value}</span>
        <span className="text-[9px] uppercase tracking-[0.15em] text-muted">Overall</span>
      </div>
    </div>
  );
}
