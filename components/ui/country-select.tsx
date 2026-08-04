"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { COUNTRIES, type CountryOption } from "@/lib/phone";
import { Search, ChevronDown } from "@/components/ui/icons";

const triggerClass =
  "flex w-36 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-paper/50 px-3 py-2.5 text-[15px] text-ink outline-none transition-colors duration-200 focus:border-gold focus:bg-card";

// SVG flags (flag-icons), not emoji — Windows Chrome/Edge don't ship colored
// regional-indicator glyphs and render e.g. 🇦🇺 as literal "AU" text.
function Flag({ iso2 }: { iso2: string }) {
  return (
    <span
      aria-hidden
      className={`fi fi-${iso2.toLowerCase()} h-3.5 w-5 shrink-0 rounded-[3px] bg-cover bg-center`}
    />
  );
}

/** Phone-country picker: a compact trigger (flag + name) that opens a
 * searchable, height-capped list — replacing the native <select>, whose open
 * panel rendered all ~245 countries as one uncontained, unsearchable column.
 *
 * The panel renders through a portal into <body>, positioned in *document*
 * coordinates (not viewport/`fixed`), so it can overflow the form card's
 * `overflow-hidden` (needed elsewhere to clip the card's rounded corners)
 * instead of being cut off at its edge. Document coordinates mean the page's
 * native scrolling carries the panel along with the trigger for free — an
 * earlier `position: fixed` + scroll-listener version had to recompute and
 * re-snap the position on every scroll tick, which read as a jitter. */
export function CountrySelect({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const listId = useId();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; bottom: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.iso2 === value);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase() === q,
    );
  }, [query]);

  function measure() {
    const r = rootRef.current?.getBoundingClientRect();
    if (r) setRect({ top: r.top + window.scrollY, left: r.left + window.scrollX, bottom: r.bottom + window.scrollY });
  }

  // Measured on open and on resize only — never on scroll. Document
  // coordinates don't change when the page scrolls, so there's nothing to
  // recompute there; a viewport resize can reflow the trigger, so that still
  // gets a remeasure.
  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", measure);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  function openMenu() {
    setQuery("");
    setHighlight(Math.max(0, COUNTRIES.findIndex((c) => c.iso2 === value)));
    setOpen(true);
    // preventScroll: focusing this input lives in a portal at the bottom of
    // <body>, and without it the browser's default scroll-into-view nudged
    // the page under the trigger, which then chased the panel back into
    // place on the next scroll-driven measure — a jump-and-settle jitter.
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }

  function choose(c: CountryOption) {
    setValue(c.iso2);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = results[highlight];
      if (c) choose(c);
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={triggerClass}
      >
        <Flag iso2={selected ? selected.iso2 : "AU"} />
        <span className="truncate">{selected ? selected.name : "Australia"}</span>
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "absolute", top: rect.bottom + 6, left: rect.left }}
            className="z-50 w-72 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-line bg-card shadow-[0_8px_24px_rgba(20,25,40,0.14)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search country or code"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted/60"
              />
            </div>
            <ul id={listId} role="listbox" className="max-h-60 overflow-y-auto py-1">
              {results.length === 0 && (
                <li className="px-3 py-2 text-[13.5px] text-muted">No matches</li>
              )}
              {results.map((c, i) => (
                <li key={c.iso2} role="option" aria-selected={c.iso2 === value}>
                  <button
                    type="button"
                    onClick={() => choose(c)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] text-ink transition-colors duration-150 ${
                      i === highlight ? "bg-paper" : ""
                    }`}
                  >
                    <Flag iso2={c.iso2} />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="shrink-0 text-muted">+{c.dialCode}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
