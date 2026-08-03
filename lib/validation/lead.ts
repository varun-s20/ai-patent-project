import { z } from "zod";
import { LEAD_STAGES, PATENT_TYPES } from "@/lib/types";

export const FULL_NAME_MAX = 120;
export const PHONE_MAX = 40;

/** Bot trap. Named to look like a field worth filling, and lives here rather
 * than in actions.ts because a "use server" module may only export async
 * functions — the form and the action both need this exact string. */
export const HONEYPOT_FIELD = "company_website";

/** Attribution values arrive on the query string, so they are visitor-supplied
 * text on a page anyone can hit with any URL. Trimmed and capped rather than
 * trusted — long enough for a real campaign name, short enough that nobody can
 * stuff the admin console (or a column) with a novel. */
const ATTRIBUTION_MAX = 200;
const attribution = z.string().trim().max(ATTRIBUTION_MAX).optional();

export const leadSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(FULL_NAME_MAX),
  email: z.string().trim().email("Enter a valid email"),
  // Optional by design: requiring a phone number measurably cuts submissions,
  // and we can always ask for it in the reply.
  phone: z.string().trim().max(PHONE_MAX).optional(),
  stage: z.enum(LEAD_STAGES),
  // What kind of patent they're after. Category/industry deliberately isn't on
  // the form: the shorter the form, the more leads, and the follow-up email can
  // ask anything a five-field form had to leave out.
  patentType: z.enum(PATENT_TYPES),
  utmSource: attribution,
  utmMedium: attribution,
  utmCampaign: attribution,
  utmTerm: attribution,
  utmContent: attribution,
  referrer: attribution,
  landingPath: attribution,
});

export type LeadSchema = z.infer<typeof leadSchema>;
