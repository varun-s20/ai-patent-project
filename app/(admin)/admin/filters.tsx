"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "@/components/ui/icons";
import { statusLabel } from "@/lib/ui/status";
import { verdictLabel } from "@/lib/ui/verdict";

const STATUSES = ["all", "draft", "paid", "processing", "complete", "failed", "refunded"] as const;
const VERDICTS = ["all", "PROCEED_NOW", "REFINE_FIRST", "DO_NOT_PATENT"] as const;
const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
] as const;

const control =
  "h-9 rounded-full border border-line bg-card px-4 text-sm outline-none transition-colors focus:border-gold";

/**
 * Live admin filter bar. The text search is debounced (300ms); selects apply
 * instantly. State lives entirely in the URL query string, so the server page
 * re-renders with the filtered query and everything stays shareable/back-able.
 */
export function AdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const debounceStarted = useRef(false);

  // Defaults that should drop the param entirely rather than clutter the URL.
  const isDefault = (key: string, value: string) =>
    !value || value === "all" || (key === "sort" && value === "newest");

  const commit = (patch: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (isDefault(key, value)) sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  // Debounce the free-text search; skip the very first render so we don't
  // immediately rewrite the URL on mount.
  useEffect(() => {
    if (!debounceStarted.current) {
      debounceStarted.current = true;
      return;
    }
    const t = setTimeout(() => commit({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const status = params.get("status") ?? "all";
  const verdict = params.get("verdict") ?? "all";
  const sort = params.get("sort") ?? "newest";
  const hasFilters = q !== "" || status !== "all" || verdict !== "all" || sort !== "newest";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or email…"
          className={`${control} w-64 pl-9 ${q ? "pr-9" : ""}`}
          aria-label="Search submissions"
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

      <Select
        label="Status"
        value={status}
        onChange={(v) => commit({ status: v })}
        options={STATUSES.map((s) => [s, s === "all" ? "All statuses" : statusLabel(s)])}
      />
      <Select
        label="Verdict"
        value={verdict}
        onChange={(v) => commit({ verdict: v })}
        options={VERDICTS.map((v) => [v, v === "all" ? "Any verdict" : verdictLabel(v)])}
      />
      <Select
        label="Sort"
        value={sort}
        onChange={(v) => commit({ sort: v })}
        options={SORTS.map(([v, l]) => [v, l])}
      />

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="h-9 rounded-full px-3 text-sm text-muted transition-colors hover:text-ink"
        >
          Clear
        </button>
      )}

      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-200 ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${control} capitalize`}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
