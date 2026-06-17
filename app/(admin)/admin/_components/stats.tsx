// app/(admin)/admin/_components/stats.tsx
import Link from "next/link";
import { Bolt, Database, Warning, ShieldCheck, type IconType } from "@/components/ui/icons";

/** Small uppercase eyebrow + italic-foil subtitle — the console page header. */
export function ConsoleHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      <p className="mt-2 font-display text-lg italic tracking-tight text-ink-2 sm:text-xl">
        {title}
      </p>
    </div>
  );
}

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

/** Light ruled stat card; optional leading icon. */
export function Stat({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon?: IconType;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 ring-1 ring-ink/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/[0.04] text-muted">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-4xl tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs text-muted">{caption}</p>
    </div>
  );
}

/** Navy feature stat — the focal tile (used on the payments page). */
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

/** Conic progress ring with a numeric core — tuned for the navy surface. */
function Ring({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-gold-bright) ${value * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
      }}
    >
      <div className="flex h-[54px] w-[54px] flex-col items-center justify-center rounded-full bg-navy-900">
        <span className="font-display text-base leading-none text-cream tabular-nums">{value}%</span>
        <span className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-cream/50">{label}</span>
      </div>
    </div>
  );
}

/**
 * Navy "active evaluations" focal card — the in-queue count beside a completion
 * ring, with a capacity bar beneath. All figures are real counts.
 */
export function ActiveEvalCard({
  inFlight,
  completed,
  total,
}: {
  inFlight: number;
  completed: number;
  total: number;
}) {
  const completion = total ? Math.round((completed / total) * 100) : 0;
  const load = total ? Math.round((inFlight / total) * 100) : 0;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-5 text-cream ring-1 ring-ink/20 shadow-[0_18px_40px_-28px_rgba(26,43,74,0.6)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.18),transparent)]"
      />
      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cream/55">
          Active evaluations
        </p>
        <Bolt className="h-4 w-4 text-gold-bright" />
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-4xl leading-none tracking-tight text-cream tabular-nums">
            {inFlight}
          </p>
          <p className="mt-1.5 text-xs text-cream/55">paid or processing, in queue</p>
        </div>
        <Ring value={completion} label="done" />
      </div>
      <div className="relative mt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-cream/45">
          <span>Queue load</span>
          <span>{load}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
            style={{ width: `${Math.min(load, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** One labelled bar row inside the system-health panel. */
function HealthBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-cream/70">
        <span className="uppercase tracking-[0.12em] text-cream/45">{label}</span>
        <span className="tabular-nums text-cream">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Dark "system health" side panel — operational status over real throughput. */
export function SystemHealth({
  total,
  completed,
  inFlight,
  users,
  net,
}: {
  total: number;
  completed: number;
  inFlight: number;
  users: number;
  net: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-6 text-cream ring-1 ring-ink/20 shadow-[0_24px_60px_-34px_rgba(13,22,38,0.85)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(228,196,90,0.14),transparent)]"
      />
      <div className="relative flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <div>
          <p className="text-sm font-medium text-cream">Systems operational</p>
          <p className="text-[11px] text-cream/50">Live data · admin console</p>
        </div>
        <Database className="ml-auto h-4 w-4 text-cream/40" />
      </div>

      <div className="relative mt-6 space-y-4">
        <HealthBar label="Completed" value={completed} total={total} />
        <HealthBar label="In progress" value={inFlight} total={total} />
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-cream/45">Registered users</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-cream tabular-nums">{users}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-cream/45">Net revenue</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-foil tabular-nums">
            ${net.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Administrator alert — surfaces the single most actionable signal. Failures
 * outrank in-flight work; a clean console says so plainly.
 */
export function AdminAlert({
  failed,
  inFlight,
  refunded,
}: {
  failed: number;
  inFlight: number;
  refunded: number;
}) {
  let tone: "warn" | "info" | "ok";
  let title: string;
  let body: string;
  let href: string | null;

  if (failed > 0) {
    tone = "warn";
    title = "Failed evaluations";
    body = `${failed} ${failed === 1 ? "evaluation has" : "evaluations have"} failed and may need a refund.`;
    href = "/admin/submissions?status=failed";
  } else if (inFlight > 0) {
    tone = "info";
    title = "Evaluations in progress";
    body = `${inFlight} ${inFlight === 1 ? "submission is" : "submissions are"} paid or processing.`;
    href = "/admin/submissions?status=processing";
  } else {
    tone = "ok";
    title = "All clear";
    body =
      refunded > 0
        ? `Nothing needs attention. ${refunded} refund${refunded === 1 ? "" : "s"} on record.`
        : "Nothing needs attention right now.";
    href = null;
  }

  const styles = {
    warn: { card: "border-amber-200 bg-amber-50", chip: "text-amber-700", Icon: Warning as IconType },
    info: { card: "border-line bg-card", chip: "text-gold", Icon: Bolt as IconType },
    ok: { card: "border-emerald-200 bg-emerald-50/60", chip: "text-emerald-700", Icon: ShieldCheck as IconType },
  }[tone];
  const Icon = styles.Icon;

  return (
    <div className={`rounded-2xl border ${styles.card} p-5 ring-1 ring-ink/[0.03]`}>
      <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${styles.chip}`}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{body}</p>
      {href && (
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-gold"
        >
          Review now →
        </Link>
      )}
    </div>
  );
}
