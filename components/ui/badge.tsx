import { type ReactNode } from "react";

/** Generic pill. Pass Tailwind bg/text/border classes via `className`. */
export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

/** Microscopic eyebrow tag that precedes major headings, with a gold foil dot. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
      {children}
    </span>
  );
}
