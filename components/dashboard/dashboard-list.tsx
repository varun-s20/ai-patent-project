"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { Search, X } from "@/components/ui/icons";
import { RowActions } from "@/components/dashboard/row-actions";
import { formatDate } from "@/lib/ui/format";
import { statusLabel } from "@/lib/ui/status";
import { verdictLabel } from "@/lib/ui/verdict";

export type DashRow = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  score: number | null;
  verdict: string | null;
  reportUrl?: string;
  certUrl?: string;
};

const control =
  "h-9 rounded-full border border-line bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-gold";

/**
 * Client-side filterable list of the viewer's ideas. The dashboard already
 * loads every row, so filtering happens in the browser — instant, no refetch.
 */
export function DashboardList({ rows, heading }: { rows: DashRow[]; heading: string }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [verdict, setVerdict] = useState("all");

  // Only offer filters for values that actually appear in the user's rows.
  const statuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))).sort(),
    [rows],
  );
  const verdicts = useMemo(
    () => Array.from(new Set(rows.map((r) => r.verdict).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (verdict !== "all" && r.verdict !== verdict) return false;
      if (needle && !r.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, status, verdict]);

  const hasFilters = q !== "" || status !== "all" || verdict !== "all";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-xl tracking-tight text-ink">{heading}</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title…"
              aria-label="Search ideas by title"
              className={`${control} w-full pl-9 sm:w-48 ${q ? "pr-9" : ""}`}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {statuses.length > 1 && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
              className={`${control} min-w-0 flex-1 capitalize sm:flex-none`}
            >
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          )}

          {verdicts.length > 1 && (
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              aria-label="Filter by verdict"
              className={`${control} min-w-0 flex-1 capitalize sm:flex-none`}
            >
              <option value="all">Any verdict</option>
              {verdicts.map((v) => (
                <option key={v} value={v}>
                  {verdictLabel(v)}
                </option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("all");
                setVerdict("all");
              }}
              className="h-9 rounded-full px-3 text-sm text-muted transition-colors hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          // Vertical card: meta up top, title + verdict in the body, actions pinned
          // to a bottom row via mt-auto so every card's buttons line up.
          <Card key={r.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <ScoreToken score={r.score} />
              <StatusBadge status={r.status} />
            </div>

            <div className="min-w-0">
              {/* Long titles ellipsize to a single line so cards stay uniform. */}
              <h3 className="truncate font-display text-lg tracking-tight text-ink" title={r.title}>
                {r.title}
              </h3>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
                {formatDate(r.createdAt)}
                {r.score !== null ? ` · ${r.score}/100` : ""}
              </p>
              {r.verdict && (
                <div className="mt-3">
                  <VerdictBadge verdict={r.verdict} />
                </div>
              )}
            </div>

            <div className="mt-auto border-t border-line pt-4">
              <RowActions id={r.id} status={r.status} reportUrl={r.reportUrl} certUrl={r.certUrl} />
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-paper/40 px-6 py-12 text-center sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted">No ideas match these filters.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setVerdict("all");
                }}
                className="mt-3 text-sm font-medium text-gold underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Small navy tile carrying the row's overall score, or the brand diamond if pending. */
function ScoreToken({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper ring-1 ring-ink/[0.06]">
        <span
          aria-hidden
          className="block h-2.5 w-2.5 rounded-[2px] bg-gold ring-1 ring-gold-bright/50"
          style={{ transform: "rotate(45deg)" }}
        />
      </span>
    );
  }
  return (
    <span className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-navy-800 to-navy-900 ring-1 ring-ink/20">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(228,196,90,0.2),transparent)]"
      />
      <span className="relative font-display text-base leading-none text-foil">{score}</span>
      <span className="relative mt-0.5 text-[7px] uppercase tracking-[0.12em] text-cream/45">/100</span>
    </span>
  );
}
