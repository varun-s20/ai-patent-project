/** Status strip pinned under the console content — honest, live-data footer. */
export function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-line px-5 py-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span>AI Invention Registry · Admin console</span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live data · server-rendered
        </span>
      </div>
    </footer>
  );
}
