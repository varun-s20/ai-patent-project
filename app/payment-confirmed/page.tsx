import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/badge";
import { CtaLink, buttonClasses } from "@/components/ui/button";
import { Check, Seal, ShieldCheck } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { Pop } from "@/components/motion/pop";
import { isCheckoutSessionId, type NextStep } from "@/lib/payment/next-step";
import { PRODUCT_NAME } from "@/lib/stripe/checkout";
import { CONFIRMATION_COOKIE, loadConfirmation } from "./load";
import { ConfirmedSeal } from "./confirmed-seal";
import { PurchaseEvent } from "./purchase-event";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment received | AI Patent Register",
  robots: { index: false, follow: false },
};

const CTA: Record<NextStep["kind"], { label: string; caption: string }> = {
  register: {
    label: "Create your account",
    caption: "Takes under a minute. Your report and certificate will be waiting inside.",
  },
  login: {
    label: "Log in to follow your evaluation",
    caption: "Use the account for the email above. We'll take you straight to it.",
  },
  status: {
    label: "Follow your evaluation live",
    caption: "Your status page updates the moment the report is ready.",
  },
};

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

/** UTC on purpose: the registration timestamp on the certificate is UTC too. */
function formatPaidAt(date: Date): string {
  const formatted = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${formatted} UTC`;
}

export default async function PaymentConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  // A link that still carries the id goes through the return hop, which
  // moves it into the cookie and strips it from the URL.
  const { session_id } = await searchParams;
  if (typeof session_id === "string") {
    redirect(`/payment-confirmed/return?session_id=${encodeURIComponent(session_id)}`);
  }

  const sessionId = (await cookies()).get(CONFIRMATION_COOKIE)?.value;
  // Nothing to confirm: someone typed the address or a crawler found it.
  // Sending them home keeps this URL meaning "a verified sale" for tracking.
  if (!isCheckoutSessionId(sessionId)) redirect("/");

  const result = await loadConfirmation(sessionId);
  if (result.state === "invalid") redirect("/");
  if (result.state === "unavailable") return <Unavailable />;

  const c = result.confirmation;
  const amount = formatMoney(c.amountCents, c.currency);
  const cta = CTA[c.next.kind];

  return (
    <main className="section-tint flex-1 overflow-x-clip">
      <PurchaseEvent
        transactionId={c.sessionId}
        value={c.amountCents / 100}
        currency={c.currency}
        itemName={PRODUCT_NAME}
      />

      <div className="mx-auto w-full max-w-2xl px-5 pt-8 pb-24 sm:px-6 sm:pt-12">
        <ConfirmedSeal />

        <div className="mt-6 text-center">
          <InView delay={0.35} y={14}>
            <Eyebrow>Payment confirmed</Eyebrow>
          </InView>
          <InView delay={0.45} y={18}>
            <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Payment <span className="text-foil">received.</span>
            </h1>
          </InView>
          <InView delay={0.55} y={18}>
            <p className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-2">
              Thank you. <span className="text-ink">&ldquo;{c.title}&rdquo;</span> is on the
              register and its evaluation has already started. Your report and certificate are
              on their way to <span className="text-ink">{c.email}</span>.
            </p>
          </InView>
          {/* The one thing to do next sits above the fold; the receipt is
              reference material and can wait for a scroll. */}
          <InView delay={0.65} y={14} className="mt-8 flex flex-col items-center">
            <CtaLink href={c.next.href} variant="primary">
              {cta.label}
            </CtaLink>
            <p className="mt-3 max-w-[42ch] text-sm text-muted">{cta.caption}</p>
          </InView>
        </div>

        <InView delay={0.8} className="mt-14">
          <Card padded={false}>
            {/* Receipt */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Receipt</p>
                <Pop
                  delay={1.1}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                >
                  <Seal className="h-3.5 w-3.5" />
                  Paid
                </Pop>
              </div>

              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold tracking-tight text-ink">
                  {amount}
                </span>
                <span className="text-sm font-medium text-muted">{c.currency}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{PRODUCT_NAME}</p>

              <dl className="mt-7 divide-y divide-line border-t border-line text-sm">
                <ReceiptRow label="Idea" value={c.title} />
                <ReceiptRow label="Paid on" value={formatPaidAt(c.paidAt)} />
                <ReceiptRow label="Receipt sent to" value={c.email} />
                <ReceiptRow label="Reference" value={c.submissionId} mono />
              </dl>
            </div>

            {/* Perforation: the tear line between the receipt and what's next. */}
            <div aria-hidden className="relative h-0">
              <span className="absolute top-0 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper ring-1 ring-ink/[0.06]" />
              <span className="absolute top-0 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-paper ring-1 ring-ink/[0.06]" />
              <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-line" />
            </div>

            {/* What happens next */}
            <div className="bg-paper/40 p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
                What happens next
              </p>
              <ol className="mt-6">
                <TimelineStep
                  state="done"
                  title="Payment received"
                  body={`${amount} confirmed by Stripe. Your idea is timestamped on the register.`}
                />
                <TimelineStep
                  state="active"
                  title="Five-dimension evaluation"
                  body="Novelty, commercial potential, defensibility, licensing and timing. Usually 2 to 5 minutes."
                />
                <TimelineStep
                  state="next"
                  title="Report and certificate"
                  body="Your PDF report and Certificate of Idea Registration, by email and in your account."
                  last
                />
              </ol>
            </div>
          </Card>
        </InView>

        <InView>
          <p className="mx-auto mt-10 flex max-w-[52ch] items-start justify-center gap-2 text-center text-[13px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            <span>
              Private by default. If the evaluation can&apos;t be completed, you&apos;re refunded
              automatically. Questions? Reply to your confirmation email and quote the reference
              above.
            </span>
          </p>
        </InView>
      </div>
    </main>
  );
}

function ReceiptRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd
        className={`min-w-0 text-ink sm:text-right ${
          mono ? "font-mono text-[12px] tracking-tight break-all text-ink-2" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function TimelineStep({
  state,
  title,
  body,
  last = false,
}: {
  state: "done" | "active" | "next";
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className={`absolute top-8 bottom-1 left-[15px] w-px ${
            state === "done" ? "bg-gradient-to-b from-gold to-line" : "bg-line"
          }`}
        />
      )}

      <span className="relative grid h-8 w-8 shrink-0 place-items-center">
        {state === "done" && (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-ink shadow-[0_4px_12px_-4px_rgba(200,160,32,0.7)]">
            <Check className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
        {state === "active" && (
          <>
            <span className="absolute inset-0 animate-[startPulse_2.4s_var(--ease-out)_infinite] rounded-full ring-2 ring-gold/60" />
            <span className="grid h-8 w-8 place-items-center rounded-full bg-cream ring-1 ring-gold/50">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />
            </span>
          </>
        )}
        {state === "next" && (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-cream ring-1 ring-line">
            <span className="h-2 w-2 rotate-45 rounded-[1.5px] bg-line" />
          </span>
        )}
      </span>

      <div className="min-w-0 pt-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
          {title}
          {state === "active" && (
            <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a6d12]">
              In progress
            </span>
          )}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}

/**
 * Stripe or the database didn't answer. The buyer has very likely paid, so
 * this must reassure, not alarm, and must not report a purchase.
 */
function Unavailable() {
  return (
    <main className="section-tint flex-1">
      <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
        <Eyebrow>Payment</Eyebrow>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink">
          We&apos;re finishing up.
        </h1>
        <p className="mt-4 text-ink-2">
          We couldn&apos;t load your receipt just now. If you completed payment, it&apos;s safe:
          your confirmation email is on its way and your evaluation will run as normal.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/payment-confirmed" className={buttonClasses("primary")}>
            Try again
          </a>
          <a href="/dashboard" className={buttonClasses("ghost")}>
            Go to your dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
