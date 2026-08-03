import type { Metadata } from "next";
import { LeadForm, type Attribution } from "./lead-form";
import { Assurance } from "@/components/home/assurance";
import { Deliverables } from "@/components/home/deliverables";
import { Faq } from "@/components/home/faq";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { Certificate, Clock, Gauge } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { LandingFooter, LandingHeader } from "../_components/chrome";

/**
 * Paid-traffic landing page. Deliberately noindexed: it says the same things as
 * the homepage in a different order, and two pages competing for one set of
 * keywords helps neither. Ads don't need the index — and this way the homepage
 * stays the single organic entry point.
 */
export const metadata: Metadata = {
  title: "Is your idea worth patenting? Find out for $49 - AI Patent Register",
  description:
    "A five-dimension AI evaluation of your invention, a pre-patent intelligence report, and a timestamped certificate of registration. In minutes, for $49 instead of $10,000.",
  robots: { index: false, follow: false },
};

/** Three claims we can stand behind literally — no counts, no fabricated
 * social proof. They run as one hairline-divided ledger row under the price. */
const PROOF = [
  { icon: Clock, value: "Minutes", label: "From submit to report" },
  { icon: Gauge, value: "5 dimensions", label: "Scored and explained" },
  { icon: Certificate, value: "Timestamped", label: "Certificate of record" },
];

/** A query string can legitimately repeat a key (`?utm_source=a&utm_source=b`);
 * take the first and ignore the rest rather than storing "a,b". */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PatentIdeaCheckPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const attribution: Attribution = {
    utmSource: first(params.utm_source),
    utmMedium: first(params.utm_medium),
    utmCampaign: first(params.utm_campaign),
    utmTerm: first(params.utm_term),
    utmContent: first(params.utm_content),
    landingPath: "/patent-idea-check",
  };

  return (
    <main className="pb-16 md:pb-0">
      {/* Above the fold. Light, like the rest of the site: white at the top
          under a soft gold bloom, settling to paper at the bottom edge. The form
          is the one raised, ring-bounded object on an otherwise flat surface —
          elevation does the work a colour inversion used to do, so the page
          reads as one continuous document instead of a stack of bands. */}
      <section className="section-light relative overflow-x-clip">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(56rem_32rem_at_14%_-14%,rgba(200,160,32,0.14),transparent_62%),radial-gradient(46rem_30rem_at_88%_6%,rgba(26,43,74,0.055),transparent_70%)]"
        />

        <LandingHeader />

        <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-16 pt-4 sm:px-10 sm:pt-6 lg:px-16 lg:pb-40 lg:pt-16">
          {/* The gutter hairline between copy and form only exists at lg, where
              there are genuinely two columns to separate. */}
          <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0">
            <div className="max-w-2xl lg:pr-16">
              <InView>
                <h1 className="font-display text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-[3.1rem] lg:text-[3.4rem]">
                  Find out if your idea is worth patenting - before you spend a fortune
                  finding out.
                </h1>
              </InView>

              <InView delay={0.08}>
                <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-2">
                  We score your invention across novelty, commercial potential,
                  defensibility, licensing and timing, then hand you an 8-section report and
                  a timestamped certificate of registration. In minutes, not a quarter.
                </p>
              </InView>

              {/* The price, set as a two-line ledger rather than a sentence. It
                  is the single most persuasive fact on the page, and a struck
                  figure directly above the real one is the shortest possible way
                  to say it — no copy required to make the comparison land. */}
              <InView delay={0.14}>
                <div className="mt-9 max-w-md overflow-hidden rounded-xl border border-line bg-card shadow-[0_18px_44px_-32px_rgba(26,43,74,0.45)]">
                  <div className="flex items-baseline justify-between gap-6 px-5 py-3.5">
                    <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted">
                      Patent attorney · first read
                    </span>
                    <span className="font-display text-[1.3rem] leading-none tracking-tight text-muted line-through decoration-muted/45 decoration-[1.5px]">
                      $10,000
                    </span>
                  </div>
                  <div aria-hidden className="h-px bg-line" />
                  <div className="flex items-baseline justify-between gap-6 bg-paper/70 px-5 py-4">
                    <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink">
                      AI Patent Register
                    </span>
                    <span className="font-display text-[2.6rem] font-semibold leading-none tracking-tight text-ink">
                      $49
                    </span>
                  </div>
                </div>
                <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
                  The same five-dimension first read, one flat fee, no retainer.
                </p>
              </InView>

              {/* Proof — hairline-divided rather than three boxed cards, so it
                  reads as one statement of fact instead of a feature grid. */}
              <InView delay={0.2}>
                <dl className="mt-10 grid grid-cols-1 gap-y-6 border-t border-line pt-8 sm:grid-cols-3 sm:gap-y-0 sm:divide-x sm:divide-line">
                  {PROOF.map((p) => (
                    <div key={p.value} className="flex items-start gap-3 sm:px-5 sm:first:pl-0">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-card">
                        <p.icon className="h-4 w-4 text-gold" />
                      </span>
                      <div>
                        <dt className="font-display text-[15px] font-semibold tracking-tight text-ink">
                          {p.value}
                        </dt>
                        <dd className="mt-0.5 text-[12.5px] leading-snug text-muted">
                          {p.label}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </InView>
            </div>

            {/* The form. `scroll-mt` keeps the card's heading clear of the top
                edge when the in-page CTAs jump back here; the negative bottom
                margin lets it hang past the fold into the next section so the
                page doesn't read as having a clean stopping point. */}
            <div
              id="lead-form"
              className="relative z-10 scroll-mt-6 lg:border-l lg:border-line lg:pl-16 lg:-mb-24"
            >
              <InView delay={0.1}>
                <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_40px_90px_-52px_rgba(26,43,74,0.55)]">
                  {/* The page's one piece of gold chrome, on the one thing that
                      matters. */}
                  <div aria-hidden className="h-1 bg-gradient-to-r from-gold to-gold-bright" />
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-ink">
                        Get your evaluation details
                      </h2>
                      <span className="mt-1 shrink-0 rounded-md border border-line bg-paper/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                        20 sec
                      </span>
                    </div>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
                      Five quick fields. We&apos;ll email you exactly how it works and follow
                      up personally - no account, no obligation.
                    </p>
                    <div className="mt-6">
                      <LeadForm attribution={attribution} />
                    </div>
                  </div>
                </div>
              </InView>
            </div>
          </div>
        </div>
      </section>

      {/* Everything below the fold is the homepage's own sections, verbatim: the
          six-stage flow, the real report and certificate shots, the
          confidentiality promise, and the questions people actually ask.
          Nothing forked, so nothing drifts. The page ends on the FAQ - no
          closing CTA band, since the header button and the phone bar both stay
          reachable from anywhere on the page. */}
      <HowItWorks />
      <Deliverables />
      <Assurance />
      <Testimonials />
      <Faq />

      <LandingFooter />

      {/* Phone-only sticky bar. Light, like the page, with the price held in
          mono on the left and the action as the only filled shape — a full gold
          band would compete with the form's own button. Plain anchor, so it
          costs no JavaScript. */}
      <a
        href="#lead-form"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-cream/95 px-4 py-2.5 backdrop-blur-sm md:hidden"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          Evaluation
          <span className="ml-1.5 text-ink">$49</span>
        </span>
        <span className="rounded-lg bg-gold px-4 py-2.5 text-[13px] font-medium tracking-tight text-ink shadow-[0_1px_2px_rgba(120,90,20,0.22)]">
          Get my details
        </span>
      </a>
    </main>
  );
}
