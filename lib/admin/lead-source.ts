// lib/admin/lead-source.ts
// One question, asked in three places in the console: did this idea arrive off
// the paid-traffic landing page, or off the main site's own form? Both post to
// the same server action and write the same two rows, so the only thing that
// separates them is the `landing_path` the form carried.

/**
 * The main site's public evaluation form. Stripe's cancel URL returns here as
 * well, so someone who abandons checkout and fills the form again is recorded
 * under this path — deliberately: that second fill is no longer an ad click,
 * and counting it as one would inflate the campaign's lead numbers.
 */
export const SITE_FORM_PATH = "/submit";

export type LeadSource = "landing" | "site";

/**
 * Written as "anything that isn't the site form is a landing page" rather than
 * matching the landing route by name, so a second ad landing page needs no
 * change here. Leads captured before `landing_path` existed are all from the
 * one landing page that existed then, and a null lands on "landing" — which is
 * the honest answer for them.
 */
export function leadSource(landingPath: string | null | undefined): LeadSource {
  return landingPath === SITE_FORM_PATH ? "site" : "landing";
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  landing: "Landing page",
  site: "Main site",
};

/**
 * PostgREST `or()` filter for "not the site form", null included. A plain
 * `neq` would drop null rows: SQL `null <> '/submit'` is null, not true, and
 * those rows are exactly the pre-`landing_path` landing-page leads.
 */
export const NOT_SITE_FORM = `landing_path.is.null,landing_path.neq.${SITE_FORM_PATH}`;
