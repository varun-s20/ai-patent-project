// app/(admin)/admin/_components/record-list.tsx
import { type ReactNode } from "react";

/**
 * Mobile presentation for the admin ledgers. Below `md` the wide tables are
 * hidden and each row renders as one of these stacked cards instead — a title
 * row up top, then label:value `Field`s — so nothing overflows a phone.
 * Desktop keeps the dense table; this is its small-screen counterpart.
 */
export function RecordCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
      {children}
    </div>
  );
}

/** Top row of a RecordCard: a primary label (often a link) and a trailing badge. */
export function RecordHead({ children }: { children: ReactNode }) {
  return <div className="flex items-start justify-between gap-3">{children}</div>;
}

/** One label:value line inside a RecordCard. Value truncates so long emails/ids
 * can never widen the card. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-ink-2">{children}</span>
    </div>
  );
}
