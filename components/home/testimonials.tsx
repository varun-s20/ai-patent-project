import { InView, Stagger, StaggerItem } from "@/components/motion/in-view";
import { Seal } from "@/components/ui/icons";

// Placeholder quotes — replace with real, attributable testimonials before launch.
// Kept honest: no fabricated metrics, first name + role only.
const QUOTES = [
  {
    quote:
      "It told me not to patent — and explained exactly why in plain English. That $49 saved me a five-figure filing on an idea that was never going to hold.",
    name: "Daniel R.",
    role: "Independent inventor",
    initials: "DR",
    verdict: "DO NOT PATENT",
    tone: "text-red-500",
  },
  {
    quote:
      "The report read like something a firm would charge thousands for. The five scores and the prior-art section gave me real confidence to move forward.",
    name: "Priya M.",
    role: "Hardware startup founder",
    initials: "PM",
    verdict: "PROCEED NOW",
    tone: "text-emerald-600",
  },
  {
    quote:
      "I sent the verification link straight to an investor. A timestamped, shareable record of my concept — that alone was worth it.",
    name: "Marcus T.",
    role: "Product designer",
    initials: "MT",
    verdict: "REFINE FIRST",
    tone: "text-amber-600",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
      <InView className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
          Early users
        </p>
        <h2 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          A decision you can stand behind.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          The point isn&rsquo;t a higher score — it&rsquo;s a clear, defensible call on whether
          your idea is worth the spend. Here&rsquo;s how that lands.
        </p>
      </InView>

      <Stagger className="mt-14 grid gap-5 md:grid-cols-3" gap={0.1}>
        {QUOTES.map((q) => (
          <StaggerItem key={q.name}>
            <figure className="hover-lift flex h-full flex-col rounded-2xl border border-line bg-card p-7 ring-1 ring-ink/[0.04] shadow-[0_24px_60px_-44px_rgba(26,43,74,0.45)] hover:shadow-[0_30px_70px_-40px_rgba(26,43,74,0.5)]">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-paper/70 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.04em] ${q.tone}`}
              >
                {q.verdict}
              </span>
              <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-ink-2">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-bright to-gold text-[13px] font-semibold tracking-tight text-navy-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
                  {q.initials}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium tracking-tight text-ink">{q.name}</span>
                  <span className="block text-[13px] text-muted">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>

      <InView delay={0.1} className="mt-8">
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <Seal className="h-3.5 w-3.5 shrink-0 text-gold" />
          Verdicts reflect each idea on its merits — including the ones we advise against filing.
        </p>
      </InView>
    </section>
  );
}
