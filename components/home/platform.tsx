import { InView } from "@/components/motion/in-view";
import { Scale, Check } from "@/components/ui/icons";

export function Platform() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <InView>
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_30px_70px_-50px_rgba(26,43,74,0.4)]">
          {/* Centred headline cell. */}
          <div className="border-b border-line px-6 py-14 text-center sm:py-16">
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
              One evaluation.{" "}
              <span className="italic text-ink-2">Idea to record.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              From a rough disclosure to a verifiable record — in a single pass, in minutes.
            </p>
          </div>

          {/* Feature triptych — two open cells flanking an elevated dark glow card. */}
          <div className="grid divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h3 className="font-display text-2xl tracking-tight text-ink">
                Scored where it{" "}
                <span className="italic text-ink-2">counts.</span>
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Five dimensions — novelty, commercial potential, defensibility, licensing,
                and timing — each scored with its own written rationale.
              </p>
            </div>

            {/* Center: the dark demo card, lifted above the grid like ref1. */}
            <div className="p-3">
              <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-b from-navy-800 to-navy-900 p-7 text-cream ring-1 ring-ink/30 shadow-[0_30px_70px_-40px_rgba(13,22,38,0.85)] lg:-my-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(75%_100%_at_50%_0%,rgba(228,196,90,0.2),transparent)]"
                />
                <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-bright to-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]">
                  <Scale className="h-6 w-6 text-navy-900" />
                </span>
                <h3 className="relative mt-6 font-display text-2xl tracking-tight text-cream">
                  A verdict you can{" "}
                  <span className="italic text-foil">act on.</span>
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-cream/70">
                  PROCEED, REFINE, or DO NOT PATENT — a clear call, plus the 30/60-day move
                  that follows from it.
                </p>
                <ul className="relative mt-6 space-y-2.5 text-sm text-cream/85">
                  {["Report and certificate, together", "Delivered in minutes"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h3 className="font-display text-2xl tracking-tight text-ink">
                Grounded in{" "}
                <span className="italic text-ink-2">public data.</span>
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Probabilistic reasoning over public filings and prior art — not a hedge in a
                chat window, and not legal advice dressed up as certainty.
              </p>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
