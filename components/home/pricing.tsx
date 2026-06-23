import { CtaLink } from "@/components/ui/button";
import { InView } from "@/components/motion/in-view";
import { CountUp } from "@/components/motion/count-up";
import { AnimatedCheck } from "@/components/motion/animated-check";

const INCLUDED = [
  {
    lead: "Five-dimension AI scoring",
    detail: "Each dimension scored, with the written rationale behind it.",
  },
  {
    lead: "8-section intelligence report",
    detail: "The full pre-patent analysis, delivered as a downloadable PDF.",
  },
  {
    lead: "Certificate of registration",
    detail: "Timestamped, QR-verifiable, and shareable at a public link.",
  },
  {
    lead: "A verdict and a next step",
    detail: "A clear call, plus the 30/60-day move that follows from it.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
      <InView className="max-w-none">
        <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          One flat price. The whole picture.
        </h2>
        <p className="mt-4 max-w-7xl text-xl leading-relaxed text-muted">
          No tiers, no upsells, no hourly meter. A single payment unlocks the complete
          evaluation, report and certificate included.
        </p>
      </InView>

      {/* Light "price ledger": the figure on the left, an itemised receipt on the
          right. Replaces the lone navy box so the section sits in the homepage's
          editorial rhythm and reserves dark surfaces for the closing CTA. */}
      <InView delay={0.05} className="mt-14">
        <div className="rounded-2xl bg-white p-1.5 ring-1 ring-line shadow-[0_30px_70px_-45px_rgba(26,43,74,0.4)]">
          <div className="grid overflow-hidden rounded-[calc(1rem-0.375rem)] border border-line bg-card lg:grid-cols-[0.82fr_1.18fr]">
            {/* The figure. */}
            <div className="relative flex flex-col p-8 sm:p-10 lg:border-r lg:border-line">
              <span className="h-px w-12 bg-gradient-to-r from-gold to-transparent" />
              <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-muted">
                The price
              </p>
              <p className="mt-4 text-base text-muted line-through decoration-line">
                Patent lawyers charge $2,000 to $10,000
              </p>
              <p className="mt-1 font-display text-6xl font-semibold leading-none tracking-tight text-ink sm:text-7xl">
                <CountUp to={49} prefix="$" />
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted">
                One evaluation. Full report. Certificate on record.
              </p>
              <div className="mt-8 flex">
                <CtaLink href="/submit" variant="gold">
                  Evaluate for $49
                </CtaLink>
              </div>
              <p className="mt-6 text-[13px] leading-relaxed text-muted">
                Automatic full refund if the evaluation ever fails to generate. No tiers, no
                hourly meter, no upsell.
              </p>
            </div>

            {/* The itemised receipt. */}
            <div className="flex flex-col bg-paper p-8 sm:p-10">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Every $49 evaluation includes
              </p>
              <ul className="mt-2 divide-y divide-line">
                {INCLUDED.map((f, i) => (
                  <li key={f.lead} className="flex items-start gap-4 py-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gold/80 ring-1 ring-gold">
                      <AnimatedCheck delay={0.15 + i * 0.12} className="h-5 w-5 text-ink" />
                    </span>
                    <span>
                      <span className="font-medium text-ink">{f.lead}</span>
                      <span className="mt-0.5 block text-base leading-relaxed text-muted">
                        {f.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-baseline justify-between border-t border-line pt-5">
                <span className="text-base font-medium text-ink">Everything above</span>
                <span className="font-display text-xl font-semibold tracking-tight text-ink">
                  $49 flat
                </span>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
