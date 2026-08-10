"use client";

const badge =
  "inline-flex items-center gap-2 rounded-lg border border-line bg-card px-2.5 py-1.5 text-[12px] leading-tight text-ink";
const key =
  "font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap";
const value = "font-mono tabular-nums tracking-tight";

/**
 * The competitive-pressure row. The one figure here (registeredCount) is a
 * count out of our own database — nothing is invented, and nothing describes
 * other people *watching*, only ideas already *registered*. The registry
 * never identifies another submitter, and copy that implied otherwise would
 * contradict the confidentiality promise the same page makes further down.
 *
 * The live registration clock used to sit here too. It now ticks in the
 * certificate preview's own Date & Time field, which is where a registration
 * timestamp actually means something — two of them said the same thing twice.
 */
export function UrgencyBadges({
  registeredCount,
  disclosed,
}: {
  registeredCount: number;
  disclosed: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {registeredCount > 0 && (
          <span className={badge}>
            <span className={key}>Checked against</span>
            <span className={value}>{registeredCount.toLocaleString("en-US")}</span>
            <span>ideas already registered</span>
          </span>
        )}

        <span className={badge}>
          <span className={key}>First to file</span>
          <span>not first to invent</span>
        </span>
      </div>

      {/* Wording only, no figure — a live-looking count that was really an
          annual average got pulled, and we're not replacing it with a
          different number nobody can source either. */}
      <span className={`${badge} border-gold bg-gold/10`}>
        Every day unregistered is a day someone else can file first.
      </span>

      {disclosed && (
        <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[12px] leading-snug text-amber-800">
          You&apos;ve already shown this publicly — that starts a 12-month window in the US, and
          in most of Europe it ends novelty immediately. Get the date on record now.
        </p>
      )}
    </div>
  );
}
