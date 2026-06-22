"use client";

import Link from "next/link";
import { Eye, FileText, Certificate, Pencil } from "@/components/ui/icons";
import { createCheckoutSession } from "@/app/(app)/pay/actions";

/**
 * Actions for a submission, shared by the dashboard grid and the featured card.
 *
 * Every status resolves to one constant shape: a single wide primary control
 * plus zero-to-two fixed 40px "document" tiles for the report and certificate.
 * Holding that skeleton — same height, never wrapping — is what keeps every
 * card's footer aligned across the grid no matter how many artifacts exist.
 *
 *   draft      →  [ Pay $49        ] [✎]
 *   processing →  [ View record         ]
 *   complete   →  [ View record ] [▣] [✦]
 *
 * `orientation="stack"` (the featured card) trades tiles for full-width,
 * labelled buttons stacked in its bordered side column.
 */

const PRIMARY =
  "inline-flex h-10 select-none items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium tracking-tight " +
  "transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card";
const INK = "bg-ink text-cream hover:bg-ink-2 shadow-[0_1px_2px_rgba(20,25,40,0.18)]";
const GOLD = "bg-gold text-ink hover:bg-gold-bright shadow-[0_1px_2px_rgba(120,90,20,0.22)]";
const GHOST = "text-ink ring-1 ring-ink/15 hover:bg-ink/[0.05]";
const GHOST_GOLD = "text-ink bg-gold/[0.10] ring-1 ring-gold/30 hover:bg-gold/[0.18]";

// Icon-only square — the report/certificate artifacts on the compact grid card.
const TILE =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg " +
  "transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function RowActions({
  id,
  status,
  reportUrl,
  certUrl,
  orientation = "row",
}: {
  id: string;
  status: string;
  reportUrl?: string;
  certUrl?: string;
  orientation?: "row" | "stack";
}) {
  const stack = orientation === "stack";
  const wrap = stack ? "flex flex-col gap-2" : "flex items-center gap-2";
  // In a row the primary flexes to absorb the leftover width; stacked, it's full.
  const grow = stack ? "w-full" : "flex-1";

  if (status === "draft") {
    return (
      <div className={wrap}>
        <form action={createCheckoutSession} className={grow}>
          <input type="hidden" name="submissionId" value={id} />
          <button type="submit" className={`${PRIMARY} ${GOLD} w-full`}>
            Pay $49
          </button>
        </form>
        {stack ? (
          <Link href={`/edit/${id}`} className={`${PRIMARY} ${GHOST} w-full`}>
            <Pencil className="h-4 w-4" />
            Edit details
          </Link>
        ) : (
          <Link
            href={`/edit/${id}`}
            aria-label="Edit details"
            title="Edit details"
            className={`${TILE} ${GHOST}`}
          >
            <Pencil className="h-[18px] w-[18px]" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={wrap}>
      <Link href={`/status/${id}`} className={`${PRIMARY} ${INK} ${grow}`}>
        <Eye className="h-4 w-4" />
        View record
      </Link>

      {stack ? (
        <>
          {reportUrl && (
            <a href={reportUrl} className={`${PRIMARY} ${GHOST} w-full`}>
              <FileText className="h-4 w-4" />
              Report
            </a>
          )}
          {certUrl && (
            <a href={certUrl} className={`${PRIMARY} ${GHOST_GOLD} w-full`}>
              <Certificate className="h-4 w-4" />
              Certificate
            </a>
          )}
        </>
      ) : (
        <>
          {reportUrl && (
            <a
              href={reportUrl}
              aria-label="Download report (PDF)"
              title="Download report (PDF)"
              className={`${TILE} ${GHOST}`}
            >
              <FileText className="h-[18px] w-[18px]" />
            </a>
          )}
          {certUrl && (
            <a
              href={certUrl}
              aria-label="Download certificate (PDF)"
              title="Download certificate (PDF)"
              className={`${TILE} ${GHOST_GOLD}`}
            >
              <Certificate className="h-[18px] w-[18px]" />
            </a>
          )}
        </>
      )}
    </div>
  );
}
