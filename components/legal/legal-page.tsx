import { type ReactNode } from "react";
import { LEGAL } from "@/lib/legal/company";

/**
 * Shared shell for /terms and /privacy. Both are long-form prose documents with
 * identical typography, so the layout lives here rather than being copied twice
 * and drifting.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="w-full px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
      <div className="mx-auto w-full max-w-184">
        <header className="border-b border-line pb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
            {LEGAL.brand}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">{intro}</p>
          <p className="mt-6 text-[13px] text-muted">Last updated {LEGAL.updated}</p>
        </header>

        <div className="mt-12 flex flex-col gap-10">{children}</div>
      </div>
    </main>
  );
}

/** One numbered clause. */
export function Clause({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold tracking-tight text-ink">
        <span className="font-mono text-sm text-gold">{n}.</span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15.5px] leading-relaxed text-ink-2">
        {children}
      </div>
    </section>
  );
}

/**
 * A clause the reader should not miss. Used for the ownership grant and the
 * confidentiality summary — the two things people actually come here to check.
 */
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold/6 p-5 text-[15.5px] leading-relaxed text-ink">
      {children}
    </div>
  );
}

/** Bulleted list with the site's gold markers. */
export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
