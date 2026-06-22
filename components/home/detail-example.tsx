import { CtaLink } from "@/components/ui/button";
import { ShieldCheck, Seal } from "@/components/ui/icons";
import { InView } from "@/components/motion/in-view";
import { EXAMPLE_SUBMISSION } from "@/lib/content/example-submission";

/**
 * Teaches input quality without a word of instruction text doing the heavy
 * lifting: the same idea (the canonical self-cooling water bottle) shown as a
 * thin one-liner beside the full picture, so the contrast makes the case that
 * more detail buys a sharper read. Ties detail back to the privacy promise —
 * share as much as you're comfortable with.
 */
export function DetailExample() {
  return (
    <section className="section-tint border-t border-line">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-24 sm:px-10 lg:px-16">
        <InView className="max-w-none">
          <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            The more you tell us, the better.
          </h2>
          <p className="mt-4 max-w-7xl text-xl leading-relaxed text-muted">
            Same idea, two ways of describing it. Share as much as you&apos;re comfortable
            with — every detail sharpens your score, report, and verdict. It&apos;s all
            private and confidential.
          </p>
        </InView>

        <InView delay={0.1} className="mt-12 grid gap-5 lg:grid-cols-2 lg:items-stretch">
          {/* Thin — a single line, not much to go on. */}
          <ExampleCard
            tone="thin"
            badge="A quick line"
            fields={[
              { label: "Invention", value: EXAMPLE_SUBMISSION.title },
              { label: "How it works", value: EXAMPLE_SUBMISSION.thinDescription },
              { label: "Problem it solves", value: "—", muted: true },
            ]}
          />

          {/* Rich — the full picture, the kind of input that scores well. */}
          <ExampleCard
            tone="rich"
            badge="The full picture"
            fields={[
              { label: "Invention", value: EXAMPLE_SUBMISSION.title },
              { label: "How it works", value: EXAMPLE_SUBMISSION.description },
              { label: "Problem it solves", value: EXAMPLE_SUBMISSION.problem },
            ]}
          />
        </InView>

        <InView delay={0.16} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <CtaLink href="/submit">Evaluate for $49</CtaLink>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
            Whatever you share stays private and confidential.
          </p>
        </InView>
      </div>
    </section>
  );
}

type Field = { label: string; value: string; muted?: boolean };

function ExampleCard({
  tone,
  badge,
  fields,
}: {
  tone: "thin" | "rich";
  badge: string;
  fields: Field[];
}) {
  const rich = tone === "rich";
  return (
    <div
      className={
        rich
          ? "relative flex flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card p-7 ring-1 ring-gold/15 shadow-[0_34px_80px_-46px_rgba(26,43,74,0.5)] sm:p-9"
          : "flex flex-col rounded-2xl border border-line bg-card/70 p-7 sm:p-9"
      }
    >
      {rich && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.12),transparent)]"
        />
      )}

      <span
        className={
          rich
            ? "relative inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/[0.14] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gold ring-1 ring-gold/25"
            : "inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
        }
      >
        {badge}
      </span>

      <dl className="relative mt-6 flex-1 space-y-4">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">{f.label}</dt>
            <dd
              className={`mt-1 text-[15px] leading-relaxed ${
                f.muted ? "text-muted/60" : "text-ink-2"
              } ${f.label === "Invention" ? "font-display text-lg font-semibold tracking-tight text-ink" : ""}`}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-7 border-t border-line pt-5">
        {rich ? (
          <div className="flex items-center gap-4">
            <span className="relative flex h-14 w-14 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-navy-800 to-navy-900 ring-1 ring-ink/20">
              <span className="font-display text-lg leading-none text-foil">
                {EXAMPLE_SUBMISSION.score}
              </span>
              <span className="mt-0.5 text-[7px] uppercase tracking-[0.12em] text-cream/45">
                /100
              </span>
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <Seal className="h-3.5 w-3.5" />
                {EXAMPLE_SUBMISSION.verdict}
              </span>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                Confident scoring across all five dimensions and a full 8-section report.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper ring-1 ring-ink/[0.06]">
              <span className="font-display text-2xl leading-none text-muted/50">?</span>
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper/60 px-2 py-0.5 text-[11px] font-semibold text-muted">
                Uncertain read
              </span>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                Too little to judge novelty or defensibility — the report would be thin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
