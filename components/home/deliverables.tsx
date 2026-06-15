import Image from "next/image";
import { CtaLink } from "@/components/ui/button";
import { InView } from "@/components/motion/in-view";
import { FileText, Seal } from "@/components/ui/icons";

const VERDICTS = [
  { label: "PROCEED NOW", tone: "text-emerald-600" },
  { label: "REFINE FIRST", tone: "text-amber-600" },
  { label: "DO NOT PATENT", tone: "text-red-500" },
];

const ITEMS = [
  {
    icon: FileText,
    title: "8-section intelligence report",
    body: "The full pre-patent analysis (scores, rationale, and competitive read) as a downloadable PDF.",
  },
  {
    icon: Seal,
    title: "Certificate of registration",
    body: "Timestamped, QR-verifiable, and shareable at a public link with investors, partners, or counsel.",
  },
];

export function Deliverables() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
      <InView className="max-w-2xl">
        <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Everything you walk away with.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Two documents, generated the moment your evaluation completes. Yours to download,
          print, and share.
        </p>
      </InView>

      {/* Plaid-style product split — copy beside a layered product visual. */}
      <InView delay={0.05} className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-line shadow-[0_30px_70px_-50px_rgba(26,43,74,0.4)]">
          <div className="grid lg:grid-cols-2">
            {/* Left: the deliverables, listed, with the verdict chips + CTA. */}
            <div className="section-tint flex flex-col justify-center gap-8 p-8 sm:p-12">
              <div className="flex flex-col gap-7">
                {ITEMS.map((it) => (
                  <div key={it.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-bright to-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]">
                      <it.icon className="h-5 w-5 text-navy-900" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{it.title}</h3>
                      <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted">
                        {it.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                  The bottom line
                </span>
                {VERDICTS.map((v) => (
                  <span
                    key={v.label}
                    className={`rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.04em] ${v.tone}`}
                  >
                    {v.label}
                  </span>
                ))}
              </div>

              <div className="flex">
                <CtaLink href="/submit" variant="gold">
                  Evaluate for $49
                </CtaLink>
              </div>
            </div>

            {/* Right: layered product shots on a navy gradient panel. */}
            <div className="relative min-h-[26rem] overflow-hidden border-t border-line bg-gradient-to-br from-navy-800 to-navy-900 lg:min-h-[34rem] lg:border-l lg:border-t-0">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_60%_0%,rgba(228,196,90,0.18),transparent)]"
              />
              {/* Report — the primary shot. */}
              <div className="absolute left-8 top-10 w-[56%] overflow-hidden rounded-xl bg-white p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)] ring-1 ring-white/10 sm:left-12">
                <div className="relative aspect-[3/4]">
                  <Image
                    src="/sample-report-scorecard.png"
                    alt="A page of the intelligence report showing the verdict and five score gauges"
                    fill
                    sizes="(max-width: 1024px) 60vw, 30vw"
                    className="rounded-md object-contain object-top"
                  />
                </div>
              </div>
              {/* Certificate — overlapping inset. */}
              <div className="absolute bottom-10 right-8 w-[48%] overflow-hidden rounded-xl bg-white p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:right-12">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/sample-certificate.png"
                    alt="The Certificate of Idea Registration, timestamped and verifiable"
                    fill
                    sizes="(max-width: 1024px) 50vw, 26vw"
                    className="rounded-md object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}
