import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter, LandingHeader } from "../../_components/chrome";
import { ShieldCheck } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";

/**
 * Where the lead form lands after a successful submit.
 *
 * It has its own URL on purpose: a distinct thank-you URL is what Google Ads
 * (and any other ad platform) counts as the conversion, and redirecting straight
 * to the homepage would leave the campaign with nothing to optimise against.
 * It also means the visitor gets an unambiguous "we have it" instead of being
 * dropped on a page that looks like they never submitted at all.
 *
 * Nothing about the lead is passed in the URL — no name, no email. Personal
 * data in a query string ends up in browser history, referrer headers and
 * analytics logs.
 */
export const metadata: Metadata = {
  title: "Thanks — we've got your details | AI Patent Register",
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  {
    title: "Check your inbox",
    body: "An email is on its way with exactly how the evaluation works and what the $49 covers.",
  },
  {
    title: "We'll follow up personally",
    body: "A real person reads every enquiry and replies — usually within one business day.",
  },
  {
    title: "Or skip the wait",
    body: "Start your evaluation now and your report and certificate come back within minutes.",
  },
];

export default function LeadThanksPage() {
  return (
    <main>
      {/* Single-column, deliberately quiet. The visitor has done the thing we
          asked; the page's whole job is to confirm it and offer the one next
          step, not to sell again. The header sits inside the band so it shares
          the same gradient rather than cutting a seam across the top. */}
      <section className="section-light relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(52rem_30rem_at_50%_-16%,rgba(200,160,32,0.13),transparent_66%)]"
        />

        <LandingHeader />

        <div className="relative mx-auto w-full max-w-3xl px-6 pb-20 pt-6 sm:px-10 sm:pt-8 lg:pb-28 lg:pt-10">
          <InView>
            {/* No "Received" badge above this: the headline already says we have
                the details, and a check tile plus an eyebrow saying the same
                thing pushed the one sentence that matters below the fold on a
                phone. */}
            <h1 className="font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              We&apos;ve got your details.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2">
              Nothing else is needed from you right now. Here&apos;s what happens next.
            </p>
          </InView>

          <ol className="mt-12 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-[0_28px_64px_-48px_rgba(26,43,74,0.45)]">
            {NEXT_STEPS.map((step, i) => (
              <InView key={step.title} delay={0.06 * i}>
                <li className="flex gap-5 px-6 py-6 sm:px-8">
                  <span className="font-mono text-[13px] font-semibold tracking-[0.08em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                      {step.title}
                    </h2>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              </InView>
            ))}
          </ol>

          <InView delay={0.2}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-lg bg-gold px-7 py-3.5 text-sm font-medium tracking-tight text-ink shadow-[0_1px_2px_rgba(120,90,20,0.22)] transition-colors duration-200 hover:bg-gold-bright"
              >
                Start your $49 evaluation
              </Link>
              {/* The client's ask — a route through to the main site — kept as
                  the secondary action so it doesn't outrank the conversion. */}
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-sm font-medium tracking-tight text-ink ring-1 ring-ink/15 transition-colors duration-200 hover:bg-ink/[0.04]"
              >
                Explore the full site
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gold" />
              Your idea stays private. We never share it and we never file on it.
            </p>
          </InView>
        </div>
      </section>

      {/* Ad-platform conversion tag goes here — this page's URL is the
          conversion event. Nothing is installed yet: it needs the real Google
          Ads / Meta id, and a tag with a placeholder id silently records
          nothing while looking like it works. */}

      <LandingFooter />
    </main>
  );
}
