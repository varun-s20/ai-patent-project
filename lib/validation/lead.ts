import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { LEAD_STAGES, PATENT_TYPES } from "@/lib/types";
import { COUNTRY_CODES, type CountryCode } from "@/lib/phone";

export const FULL_NAME_MAX = 120;
export const PHONE_MAX = 40;

/** Bot trap. Lives here rather than in actions.ts because a "use server"
 * module may only export async functions — the form and the action both need
 * this exact string.
 *
 * The name matters more than it looks. This was `company_website`, which
 * Chrome's autofill classifies as COMPANY_NAME (its matcher keys off the
 * substring "company"), so picking a saved address profile on the visible
 * name/email/phone fields silently filled the trap too — and a real paying
 * customer was thrown away mid-form. Anything an autofill heuristic
 * recognises (company, business, organisation, address, website, url, email,
 * name, phone, fax, nickname) is unusable here. */
export const HONEYPOT_FIELD = "subject_line";

/** Attribution values arrive on the query string, so they are visitor-supplied
 * text on a page anyone can hit with any URL. Trimmed and capped rather than
 * trusted — long enough for a real campaign name, short enough that nobody can
 * stuff the admin console (or a column) with a novel. */
const ATTRIBUTION_MAX = 200;
/** Shared with the public evaluation form, which posts the same UTM set. */
export const attributionField = z.string().trim().max(ATTRIBUTION_MAX).optional();

export const leadSchema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your name").max(FULL_NAME_MAX),
    email: z.string().trim().email("Enter a valid email"),
    // The country the visitor is in — chosen alongside phone so we know which
    // dial code and numbering plan the number belongs to. Refined rather than
    // z.enum() because the list comes from libphonenumber-js at runtime, not
    // a fixed literal tuple.
    country: z
      .string()
      .trim()
      .refine((v) => COUNTRY_CODES.includes(v as CountryCode), "Select a country"),
    // Mandatory: the phone number is how a lead's region gets captured, not
    // just a way to reach them.
    phone: z.string().trim().min(1, "Enter your phone number").max(PHONE_MAX),
    stage: z.enum(LEAD_STAGES),
    // What kind of patent they're after. Category/industry deliberately isn't on
    // the form: the shorter the form, the more leads, and the follow-up email can
    // ask anything a five-field form had to leave out.
    patentType: z.enum(PATENT_TYPES),
    utmSource: attributionField,
    utmMedium: attributionField,
    utmCampaign: attributionField,
    utmTerm: attributionField,
    utmContent: attributionField,
    referrer: attributionField,
    landingPath: attributionField,
  })
  // Real per-region validity, not just "non-empty" — a country + phone that
  // don't actually match is worse than no phone at all for a follow-up call.
  // Skips when the country itself is invalid — that error is already
  // reported on the country field, and libphonenumber-js needs a real
  // CountryCode to check against.
  .refine(
    (d) =>
      !COUNTRY_CODES.includes(d.country as CountryCode) ||
      isValidPhoneNumber(d.phone, d.country as CountryCode),
    { message: "Enter a valid phone number for the selected country", path: ["phone"] },
  );

export type LeadSchema = z.infer<typeof leadSchema>;
