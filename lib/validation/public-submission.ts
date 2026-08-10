// The one form on the payment-first path: contact details and the idea, posted
// together by a visitor with no session. Deliberately the union of the lead
// form's contact fields and the paid form's idea fields — the evaluation is
// only as good as the description, so the description rules do NOT relax just
// because the form now sits on a landing page.

import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { INDUSTRIES } from "@/lib/types";
import { COUNTRY_CODES, type CountryCode } from "@/lib/phone";
import { attributionField, FULL_NAME_MAX, PHONE_MAX } from "@/lib/validation/lead";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  PROBLEM_MAX,
  TITLE_MAX,
} from "@/lib/validation/submission";

/** Exported separately from the refined schema because a refined schema is a
 * ZodEffects, which has no `.shape` — tests and any future field introspection
 * need the plain object. */
export const publicSubmissionFields = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(FULL_NAME_MAX),
  email: z.string().trim().email("Enter a valid email"),
  country: z
    .string()
    .trim()
    .refine((v) => COUNTRY_CODES.includes(v as CountryCode), "Select a country"),
  phone: z.string().trim().min(1, "Enter your phone number").max(PHONE_MAX),
  title: z.string().trim().min(1, "Title is required").max(TITLE_MAX),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Description must be at least ${DESCRIPTION_MIN} characters`)
    .max(DESCRIPTION_MAX, `Description must be at most ${DESCRIPTION_MAX} characters`),
  problem: z.string().trim().max(PROBLEM_MAX).optional(),
  industry: z.enum(INDUSTRIES),
  utmSource: attributionField,
  utmMedium: attributionField,
  utmCampaign: attributionField,
  utmTerm: attributionField,
  utmContent: attributionField,
  referrer: attributionField,
  landingPath: attributionField,
});

export const publicSubmissionSchema = publicSubmissionFields.refine(
  (d) => {
    if (!COUNTRY_CODES.includes(d.country as CountryCode)) return true;

    // isValidPhoneNumber silently ignores its country argument once the phone
    // string carries an explicit + calling code, so we must extract and compare
    // the actual country from +X numbers to prevent mismatches.
    if (d.phone.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(d.phone);
      // `parsed.country` is `undefined` for non-geographic and shared-NANP
      // ranges (e.g. US toll-free +1 800…) — that is libphonenumber saying
      // "no single country owns this," not a mismatch, so only reject an
      // actual disagreeing country.
      if (parsed?.country && parsed.country !== d.country) return false;
    }

    // Validate the number is valid for the selected country
    return isValidPhoneNumber(d.phone, d.country as CountryCode);
  },
  { message: "Enter a valid phone number for the selected country", path: ["phone"] },
);

export type PublicSubmissionSchema = z.infer<typeof publicSubmissionSchema>;
