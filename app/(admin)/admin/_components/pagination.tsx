import Link from "next/link";

/** Prev/Next pager for admin list pages — preserves every other query param
 * (status/verdict/q/sort/etc.) so paging never resets an active filter. */
export function Pagination({
  page,
  hasNext,
  basePath,
  searchParams,
}: {
  page: number;
  hasNext: boolean;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (page === 1 && !hasNext) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const linkClass =
    "rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-ink/[0.05]";
  const disabledClass = "rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted/50";

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-muted">Page {page}</p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClass}>
            ← Previous
          </Link>
        ) : (
          <span className={disabledClass}>← Previous</span>
        )}
        {hasNext ? (
          <Link href={hrefFor(page + 1)} className={linkClass}>
            Next →
          </Link>
        ) : (
          <span className={disabledClass}>Next →</span>
        )}
      </div>
    </div>
  );
}
