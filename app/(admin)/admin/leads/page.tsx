// app/(admin)/admin/leads/page.tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/ui/format";
import { setLeadContacted } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { SectionHead } from "../_components/stats";
import { RecordCard, RecordHead, Field } from "../_components/record-list";
import { Pagination } from "../_components/pagination";
import { ActionNotice } from "../_components/notice";
import { ReturnTo } from "../_components/return-to";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/pagination";
import type { LeadStatus } from "@/lib/types";
import { COUNTRIES, type CountryCode } from "@/lib/phone";
import { NOT_SITE_FORM } from "@/lib/admin/lead-source";

export const dynamic = "force-dynamic";

const th = "px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted";
const td = "px-5 py-3";
const rowAction = "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200";

type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  /** Null only for leads captured before 0013 added the column. */
  country: string | null;
  /** Null for leads captured after 0014 dropped the qualifier from the form. */
  stage: string | null;
  /** Null only for leads captured before 0012 added the column. */
  patent_type: string | null;
  /** The idea itself. Null only for leads captured before 0014 — every lead
   * from the payment-first form carries one, which is what makes a follow-up
   * able to name the invention instead of "your recent enquiry". */
  title: string | null;
  description: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  status: LeadStatus;
  created_at: string;
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  converted: "border-line bg-paper/60 text-ink-2",
  junk: "border-line bg-paper/60 text-muted",
};

function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}
    >
      {status === "new" ? "Pending" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/** Where the click came from. Falls back honestly rather than inventing a
 * source: no UTMs on the landing URL means we genuinely don't know. */
function sourceLabel(lead: LeadRow): string {
  if (!lead.utm_source && !lead.utm_campaign) return "direct / unknown";
  return [lead.utm_source, lead.utm_campaign].filter(Boolean).join(" · ");
}

/** Pending "Mark contacted" / handled "Reopen" control. Converted and junk
 * leads have no toggle — the action refuses them, so offering one would lie. */
function LeadAction({ lead }: { lead: LeadRow }) {
  if (lead.status === "converted" || lead.status === "junk") {
    return <span className="text-xs text-muted">—</span>;
  }
  const contacted = lead.status === "contacted";
  return (
    <form action={setLeadContacted}>
      <ReturnTo />
      <input type="hidden" name="leadId" value={lead.id} />
      <input type="hidden" name="contacted" value={contacted ? "false" : "true"} />
      <SubmitButton
        unstyled
        ariaLabel={
          contacted ? `Reopen lead ${lead.full_name}` : `Mark ${lead.full_name} contacted`
        }
        pendingLabel={contacted ? "Reopening…" : "Saving…"}
        className={
          contacted
            ? `${rowAction} border border-line text-ink-2 hover:bg-ink/[0.04]`
            : `${rowAction} border border-emerald-200 text-emerald-700 hover:bg-emerald-50`
        }
      >
        {contacted ? "Reopen" : "Mark contacted"}
      </SubmitButton>
    </form>
  );
}

/** Copy-ready mailto so one click starts the reply. */
function contactHref(lead: LeadRow): string {
  return `mailto:${lead.email}?subject=${encodeURIComponent("Your invention idea evaluation")}`;
}

/** Flag for the lead's captured region, next to their phone number. Blank for
 * leads written before 0013 added the column, or an unrecognised code. */
function countryFlag(country: string | null): string {
  return COUNTRIES.find((c) => c.iso2 === (country as CountryCode))?.flag ?? "";
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; notice?: string }>;
}) {
  const { page: pageParam, notice } = await searchParams;
  const page = parsePage(pageParam);
  const admin = createAdminClient();
  const { from, to } = pageRange(page);

  // Landing-page leads only, on all three counts. The main site's /submit form
  // writes a lead row too — same action, same table — but this view is a
  // qualification queue for paid traffic: someone who found the site on their
  // own and abandoned checkout is an idea to follow up in Submissions, not an
  // ad click to call. Stripe's cancel URL returns to /submit, so those retries
  // are filtered out here as well.
  const rowsQuery = admin
    .from("leads")
    .select(
      "id, full_name, email, phone, country, stage, patent_type, title, description, utm_source, utm_campaign, status, created_at",
    )
    .or(NOT_SITE_FORM)
    .order("created_at", { ascending: false })
    .range(from, to);

  const countQuery = admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .or(NOT_SITE_FORM);

  const pendingQuery = admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .or(NOT_SITE_FORM)
    .eq("status", "new");

  const [
    { data: rowsData, error: rowsError },
    { count: totalCount },
    { count: pendingCount },
  ] = await Promise.all([rowsQuery, countQuery, pendingQuery]);

  const hasNext = (rowsData?.length ?? 0) > PAGE_SIZE;
  const rows = ((rowsData ?? []) as LeadRow[]).slice(0, PAGE_SIZE);

  return (
    <main>
      <SectionHead title="Leads" count={totalCount ?? rows.length} />
      <p className="mt-2 text-sm text-muted">
        Ad landing-page form fills only — ideas submitted on the main site are in{" "}
        <Link href="/admin/submissions?source=site" className="text-ink-2 underline-offset-2 hover:text-gold hover:underline">
          Submissions
        </Link>
        .{" "}
        {(pendingCount ?? 0) > 0 ? (
          <span className="font-medium text-amber-700">{pendingCount} not contacted yet.</span>
        ) : (
          <span className="font-medium text-emerald-700">All caught up.</span>
        )}
      </p>

      <ActionNotice notice={notice} />

      {rowsError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load leads ({rowsError.message}). This is not the same as &quot;no
          leads&quot; — try reloading.
        </p>
      )}

      {/* Desktop: table. */}
      <Card padded={false} className="mt-4 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-line bg-paper/40">
              <tr>
                <th className={th}>Received</th>
                <th className={th}>Lead</th>
                <th className={th}>Idea</th>
                <th className={th}>Source</th>
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-paper/40"
                >
                  <td className={`${td} whitespace-nowrap text-muted`}>
                    {formatDate(lead.created_at)}
                  </td>
                  <td className={`${td} max-w-[240px]`}>
                    <span className="block truncate font-medium text-ink">{lead.full_name}</span>
                    <a
                      href={contactHref(lead)}
                      className="block truncate text-xs text-muted hover:text-gold"
                    >
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="block truncate text-xs text-muted hover:text-gold"
                      >
                        {countryFlag(lead.country)} {lead.phone}
                      </a>
                    )}
                  </td>
                  <td className={`${td} max-w-[280px] text-ink-2`}>
                    {lead.title ? (
                      <>
                        <span className="block truncate font-medium text-ink">{lead.title}</span>
                        {lead.description && (
                          <span className="line-clamp-2 text-[12px] text-muted">
                            {lead.description}
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${td} max-w-[200px] truncate text-muted`}>
                    {sourceLabel(lead)}
                  </td>
                  <td className={td}>
                    <StatusChip status={lead.status} />
                  </td>
                  <td className={td}>
                    <LeadAction lead={lead} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No landing-page leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Phone: stacked cards. */}
      <div className="mt-4 space-y-3 md:hidden">
        {rows.map((lead) => (
          <RecordCard key={lead.id}>
            <RecordHead>
              <span className="min-w-0 truncate font-medium text-ink">{lead.full_name}</span>
              <StatusChip status={lead.status} />
            </RecordHead>
            <div className="mt-3 space-y-1.5">
              <Field label="Email">
                <a href={contactHref(lead)} className="hover:text-gold">
                  {lead.email}
                </a>
              </Field>
              {lead.phone && (
                <Field label="Phone">
                  <a href={`tel:${lead.phone}`} className="hover:text-gold">
                    {countryFlag(lead.country)} {lead.phone}
                  </a>
                </Field>
              )}
              <Field label="Idea">{lead.title ?? "—"}</Field>
              <Field label="Source">{sourceLabel(lead)}</Field>
              <Field label="Received">{formatDate(lead.created_at)}</Field>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <LeadAction lead={lead} />
            </div>
          </RecordCard>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-paper/40 px-4 py-8 text-center text-sm text-muted">
            No landing-page leads yet.
          </p>
        )}
      </div>

      <Pagination page={page} hasNext={hasNext} basePath="/admin/leads" searchParams={{}} />
    </main>
  );
}
