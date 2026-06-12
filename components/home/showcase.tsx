import Image from "next/image";
import { InView } from "@/components/motion/in-view";

const TAGS = ["Report", "Certificate", "Verdict"];

export function Showcase() {
  return (
    <section className="px-4 py-6 sm:px-6">
      <InView>
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 px-6 py-16 ring-1 ring-ink/20 shadow-[0_40px_100px_-50px_rgba(13,22,38,0.85)] sm:px-12 sm:py-24">
          {/* Ghosted background headline — static, decorative, never interactive. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-6 bottom-6 select-none whitespace-nowrap font-display text-[18vw] font-medium leading-none tracking-tight text-cream/[0.04] sm:text-[12vw]"
          >
            on the record.
          </span>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(228,196,90,0.16),transparent)]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left: the headline + the "in minutes" blurb with tag pills. */}
            <div className="flex flex-col gap-8 lg:col-span-4">
              <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-cream sm:text-5xl">
                Built for the way{" "}
                <span className="italic text-foil">inventors</span> actually work.
              </h2>
              <div>
                <h3 className="font-display text-xl tracking-tight text-cream">
                  Yours in <span className="italic text-foil">minutes.</span>
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/65">
                  Submit, and the full evaluation lands on your dashboard and in your inbox —
                  no scheduling, no waiting weeks.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {TAGS.map((t) => (
                    <li
                      key={t}
                      className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-cream/80 ring-1 ring-white/10"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Center: the real scorecard, framed. */}
            <div className="lg:col-span-4">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                <div className="relative h-full w-full">
                  <Image
                    src="/sample-report-scorecard.png"
                    alt="A page of the intelligence report showing the verdict and five score gauges"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="rounded-lg object-contain object-top shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]"
                  />
                </div>
              </div>
            </div>

            {/* Right: the "clarity" and "forever" supporting blurbs. */}
            <div className="flex flex-col gap-8 lg:col-span-4">
              <div>
                <h3 className="font-display text-xl tracking-tight text-cream">
                  Built for <span className="italic text-foil">clarity.</span>
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/65">
                  Every dimension scored, every score reasoned. Read it, trust it, and move
                  from idea to decision with control.
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl tracking-tight text-cream">
                  On the record, <span className="italic text-foil">forever.</span>
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/65">
                  A timestamped certificate you can verify at a public link and share with
                  investors, partners, or counsel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
