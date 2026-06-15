import { CtaLink } from "@/components/ui/button";
import { Check, X, Seal } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";

type Line = { ok: boolean; text: string };

const OPTIONS: {
  name: string;
  cost: string;
  lines: Line[];
}[] = [
  {
    name: "Hire a patent lawyer",
    cost: "$5,000 to $15,000",
    lines: [
      { ok: true, text: "They evaluate and file for you" },
      { ok: false, text: "Paid whether or not it's worth filing" },
      { ok: false, text: "Takes weeks, not minutes" },
    ],
  },
  {
    name: "Ask free AI",
    cost: "$0",
    lines: [
      { ok: true, text: "Instant, and costs nothing" },
      { ok: false, text: "A generic, hedged answer" },
      { ok: false, text: "Can't date-stamp your idea against the registry" },
    ],
  },
  {
    name: "File blind",
    cost: "$1,000 to $5,000",
    lines: [
      { ok: true, text: "Goes straight to the patent office" },
      { ok: false, text: "Easy to burn fees on an unviable idea" },
      { ok: false, text: "No read on whether it's novel" },
    ],
  },
];

const OURS: Line[] = [
  { ok: true, text: "A real verdict, not a hedge" },
  { ok: true, text: "Date-stamped against every idea on the registry" },
  { ok: true, text: "Private, shared only if you ask us to" },
  { ok: true, text: "Full report in minutes, refund-backed" },
];

/** One open comparison column — label, headline cost, and a pro/con list. */
function OptionColumn({ name, cost, lines }: (typeof OPTIONS)[number]) {
  return (
    <div className="flex flex-col p-7 sm:p-8">
      <p className="text-base font-medium text-ink-2">{name}</p>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">{cost}</p>
      <ul className="mt-6 space-y-3">
        {lines.map((l) => (
          <li key={l.text} className="flex items-start gap-2.5 text-base">
            {l.ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted/50" />
            )}
            <span className={l.ok ? "text-ink-2" : "text-muted"}>{l.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Comparison() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
      {/* Section header — stacked heading + subheading, matching every other
          section's intro rhythm (was previously split across the card's grid). */}
      <InView className="max-w-none">
        <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Four ways to answer one question.
        </h2>
        <p className="mt-4 max-w-7xl text-xl leading-relaxed text-muted">
          Every inventor faces the same fork before filing. Only one gives you a verdict{" "}
          <span className="text-ink-2">and</span> a dated record of who had the idea first.
        </p>
      </InView>

      <InView delay={0.05} className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_30px_70px_-50px_rgba(26,43,74,0.4)]">
          {/* Tier grid — the featured card sits second, lifted out of the line grid
              with a warm bloom rising from its base, exactly like ref3's "Popular". */}
          <div className="grid divide-y divide-line lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            <OptionColumn {...OPTIONS[0]} />

            {/* Our column — the dark glow card, elevated above the grid. */}
            <div>
              <div className="hover-lift relative z-10 flex h-full flex-col overflow-hidden bg-gradient-to-b from-navy-800 to-navy-900 p-6 text-cream ring-1 ring-ink/30 shadow-[0_30px_70px_-40px_rgba(13,22,38,0.85)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(90%_130%_at_50%_120%,rgba(228,196,90,0.24),transparent_72%)]"
                />
                <div className="relative flex items-center justify-between gap-3">
                  <p className="text-base font-medium text-cream">AI Invention Registry</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm">
                    <Seal className="h-3 w-3 text-gold" />
                    Recommended
                  </span>
                </div>
                <p className="relative mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-semibold tracking-tight text-gold-bright">$49</span>
                  <span className="text-sm text-cream/55">flat</span>
                </p>
                <ul className="relative mt-6 space-y-3">
                  {OURS.map((l) => (
                    <li
                      key={l.text}
                      className="flex items-start gap-2.5 text-base text-cream/85"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright" />
                      <span>{l.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="relative mt-auto pt-7">
                  <CtaLink href="/submit" variant="gold">
                    Evaluate for $49
                  </CtaLink>
                </div>
              </div>
            </div>

            <OptionColumn {...OPTIONS[1]} />
            <OptionColumn {...OPTIONS[2]} />
          </div>
        </div>
      </InView>
    </section>
  );
}
