// app/(admin)/admin/_components/stats.tsx
/** Section heading with a gold-dotted count chip. */
export function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="font-display text-2xl tracking-tight text-ink">{title}</h2>
      <span className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-cream/60 px-2.5 py-0.5 text-[11px] font-medium text-muted">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
        {count}
        {count === 200 ? "+" : ""}
      </span>
    </div>
  );
}

/** Light ruled stat card. */
export function Stat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 ring-1 ring-ink/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{caption}</p>
    </div>
  );
}

/** Navy feature stat — the focal tile. */
export function FeatureStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-5 text-cream ring-1 ring-ink/20 shadow-[0_18px_40px_-28px_rgba(26,43,74,0.6)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.16),transparent)]"
      />
      <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-cream/55">
        {label}
      </p>
      <p className="relative mt-3 font-display text-4xl tracking-tight text-cream tabular-nums">
        {value}
      </p>
      <p className="relative mt-1.5 text-xs text-cream/55">{caption}</p>
    </div>
  );
}
