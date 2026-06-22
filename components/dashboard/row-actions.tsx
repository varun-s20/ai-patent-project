"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/(app)/pay/actions";

/**
 * Action buttons for a submission row, shared by the dashboard list and the
 * featured card. A draft has no report yet, so it gets Edit + a Pay button that
 * runs the Stripe checkout server action directly — skipping the /pay page.
 * Every other status keeps the View / Report / Certificate links.
 */
export function RowActions({
  id,
  status,
  reportUrl,
  certUrl,
}: {
  id: string;
  status: string;
  reportUrl?: string;
  certUrl?: string;
}) {
  if (status === "draft") {
    return (
      <div className="flex flex-wrap gap-2">
        <Link href={`/edit/${id}`} className={buttonClasses("ghost")}>
          Edit
        </Link>
        <form action={createCheckoutSession}>
          <input type="hidden" name="submissionId" value={id} />
          <button type="submit" className={buttonClasses("gold")}>
            Pay $49
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/status/${id}`} className={buttonClasses("ghost")}>
        View
      </Link>
      {reportUrl && (
        <a href={reportUrl} className={buttonClasses("ghost")}>
          Report
        </a>
      )}
      {certUrl && (
        <a href={certUrl} className={buttonClasses("gold")}>
          Certificate
        </a>
      )}
    </div>
  );
}
