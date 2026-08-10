"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { startRouteProgress } from "@/components/ui/route-progress";
import { statusLabel } from "@/lib/ui/status";
import { verdictLabel } from "@/lib/ui/verdict";

/** Real column values only. Ownership and origin used to be smuggled in here
 * as synthetic options ("Unclaimed", "Paid, unclaimed"), which meant the three
 * questions could never be combined — see the header comment in
 * admin/submissions/page.tsx. They are their own selects now. */
const STATUSES = ["all", "draft", "paid", "processing", "complete", "failed", "refunded"] as const;
/** Which form the idea was typed into. Both write the same rows, so this is
 * the only thing separating an ad click from someone who found the site. */
const SOURCES = [
  ["all", "Any source"],
  ["landing", "Landing page"],
  ["site", "Main site"],
] as const;
/** Whether an account is attached yet. Paired with status=paid this is the
 * support query that matters: someone spent $49 and never signed up. */
const ACCOUNTS = [
  ["all", "Claimed or not"],
  ["claimed", "Has an account"],
  ["unclaimed", "No account yet"],
] as const;
const VERDICTS = ["all", "PROCEED_NOW", "REFINE_FIRST", "DO_NOT_PATENT"] as const;
const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
] as const;

const USER_ROLES = [
  ["all", "Any role"],
  ["admin", "Admins"],
  ["flagged", "Flagged"],
  ["disabled", "Disabled"],
] as const;
const USER_REFERRALS = [
  ["all", "Any referral state"],
  ["requested", "Referral requested"],
  ["pending", "Referral pending"],
] as const;
export const USER_SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["ideas", "Most ideas"],
  ["score", "Highest avg score"],
] as const;

const control =
  "h-9 rounded-full border border-line bg-card px-4 text-sm outline-none transition-colors focus:border-gold";

/** One URL-backed dropdown. `fallback` is the value that means "no filter" and
 * is dropped from the query string rather than cluttering it. */
export type FilterSelect = {
  key: string;
  label: string;
  fallback: string;
  options: readonly (readonly [string, string])[];
};

/**
 * Live admin filter bar. The text search is debounced (300ms); selects apply
 * instantly. State lives entirely in the URL query string, so the server page
 * re-renders with the filtered query and everything stays shareable/back-able.
 * Shared by every admin ledger — each one just declares its own selects.
 */
export function FilterBar({
  searchLabel,
  searchPlaceholder,
  selects,
}: {
  searchLabel: string;
  searchPlaceholder: string;
  selects: readonly FilterSelect[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const debounceStarted = useRef(false);

  // Defaults that should drop the param entirely rather than clutter the URL.
  const isDefault = (key: string, value: string) =>
    !value || selects.some((s) => s.key === key && s.fallback === value);

  const commit = (patch: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (isDefault(key, value)) sp.delete(key);
      else sp.set(key, value);
    }
    // Any filter change must land back on page 1 — otherwise a narrower
    // result set can strand the view on a now-nonexistent page, rendering
    // "no results" even though page 1 of the new filter has plenty.
    sp.delete("page");
    // The last action's banner belongs to the view it fired from, not to
    // whatever the admin filters to next.
    sp.delete("notice");
    const qs = sp.toString();
    // A filtered ledger is a server round-trip, and until it lands the old
    // rows stay on screen — nothing about the page says the click registered.
    // Drive the same top bar a link navigation drives, so filtering looks like
    // every other page load in the console. Skipped when the URL doesn't
    // actually change: nothing would commit, and the bar would hang until its
    // own 8s safety timeout.
    if (qs !== params.toString()) startRouteProgress();
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

  const hasFilters =
    q !== "" || selects.some((s) => (params.get(s.key) ?? s.fallback) !== s.fallback);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-auto">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className={`${control} w-full pl-9 sm:w-64 ${q ? "pr-9" : ""}`}
          aria-label={searchLabel}
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

      {selects.map((s) => (
        <Select
          key={s.key}
          label={s.label}
          value={params.get(s.key) ?? s.fallback}
          onChange={(v) => commit({ [s.key]: v })}
          options={s.options}
        />
      ))}

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            if (params.toString()) startRouteProgress();
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="h-9 rounded-full px-3 text-sm text-muted transition-colors hover:text-ink"
        >
          Clear
        </button>
      )}

      {/* In-place confirmation that the filter was taken, next to the control
          that was just changed — the top bar alone is easy to miss when the
          eye is on the dropdown. `role="status"` announces it too. */}
      <span
        role="status"
        aria-live="polite"
        className={`inline-flex h-9 items-center gap-2 px-1 text-sm text-muted transition-opacity duration-200 ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
      >
        <Spinner className="h-3.5 w-3.5" />
        {isPending ? "Updating…" : ""}
      </span>
    </div>
  );
}

/** Filter bar for /admin/submissions. */
export function AdminFilters() {
  return (
    <FilterBar
      searchLabel="Search submissions"
      searchPlaceholder="Search title or email…"
      selects={[
        {
          key: "status",
          label: "Status",
          fallback: "all",
          options: STATUSES.map(
            (s) => [s, s === "all" ? "All statuses" : statusLabel(s)] as const,
          ),
        },
        { key: "source", label: "Source", fallback: "all", options: SOURCES },
        { key: "account", label: "Account", fallback: "all", options: ACCOUNTS },
        {
          key: "verdict",
          label: "Verdict",
          fallback: "all",
          options: VERDICTS.map((v) => [v, v === "all" ? "Any verdict" : verdictLabel(v)]),
        },
        { key: "sort", label: "Sort", fallback: "newest", options: SORTS },
      ]}
    />
  );
}

/** Filter bar for /admin/users. */
export function UserFilters() {
  return (
    <FilterBar
      searchLabel="Search users"
      searchPlaceholder="Search name or email…"
      selects={[
        { key: "role", label: "Role", fallback: "all", options: USER_ROLES },
        { key: "referral", label: "Referral", fallback: "all", options: USER_REFERRALS },
        { key: "sort", label: "Sort", fallback: "newest", options: USER_SORTS },
      ]}
    />
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
