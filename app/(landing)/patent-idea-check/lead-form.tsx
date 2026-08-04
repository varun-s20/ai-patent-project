"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLead, type LeadState } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { LEAD_STAGES, PATENT_TYPES } from "@/lib/types";
import { FULL_NAME_MAX, HONEYPOT_FIELD, PHONE_MAX } from "@/lib/validation/lead";
import { CountrySelect } from "@/components/ui/country-select";

// Mirrors the field styling in components/submission-form.tsx, a touch denser:
// five fields sit inside a card here, not down a full page. Restated rather
// than imported so this page never pulls the paid-flow form into its bundle.
const inputClass =
  "w-full rounded-xl border border-line bg-paper/50 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";
const labelClass = "block text-[11px] font-medium uppercase tracking-[0.16em] text-muted";

export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPath: string;
}

export function LeadForm({ attribution }: { attribution: Attribution }) {
  const [state, formAction] = useActionState<LeadState, FormData>(createLead, {});
  const referrerRef = useRef<HTMLInputElement>(null);

  // document.referrer only exists in the browser, and it's the one attribution
  // signal the server can't read off the URL — so it's filled on mount.
  useEffect(() => {
    if (referrerRef.current) referrerRef.current.value = document.referrer;
  }, []);

  // No success branch here: a saved lead redirects to /patent-idea-check/thanks
  // from the action, so that URL is the ad platform's conversion event.
  return (
    <form action={formAction} className="space-y-3.5">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="l-name" className={labelClass}>
          Full name
        </label>
        <input
          id="l-name"
          name="fullName"
          required
          maxLength={FULL_NAME_MAX}
          autoComplete="name"
          placeholder="Your full name"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="l-email" className={labelClass}>
          Email
        </label>
        <input
          id="l-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      {/* The two qualifiers sit side by side above `sm` — same information, one
          row less to scroll past on the way to the button. */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="l-type" className={labelClass}>
            What do you need?
          </label>
          <select
            id="l-type"
            name="patentType"
            required
            defaultValue=""
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="" disabled>
              Select one
            </option>
            {PATENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="l-stage" className={labelClass}>
            Where are you at?
          </label>
          <select
            id="l-stage"
            name="stage"
            required
            defaultValue=""
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="" disabled>
              Select one
            </option>
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="l-phone" className={labelClass}>
          Phone
        </label>
        <div className="mt-1.5 flex gap-2">
          <CountrySelect name="country" />
          <input
            id="l-phone"
            name="phone"
            type="tel"
            required
            maxLength={PHONE_MAX}
            autoComplete="tel"
            placeholder="Your number"
            className={`min-w-0 flex-1 ${inputClass}`}
          />
        </div>
      </div>

      {/* Attribution — invisible to the visitor, and the reason we can tell
          which campaign actually paid for a lead. */}
      <input type="hidden" name="utmSource" value={attribution.utmSource ?? ""} />
      <input type="hidden" name="utmMedium" value={attribution.utmMedium ?? ""} />
      <input type="hidden" name="utmCampaign" value={attribution.utmCampaign ?? ""} />
      <input type="hidden" name="utmTerm" value={attribution.utmTerm ?? ""} />
      <input type="hidden" name="utmContent" value={attribution.utmContent ?? ""} />
      <input type="hidden" name="landingPath" value={attribution.landingPath} />
      <input ref={referrerRef} type="hidden" name="referrer" defaultValue="" />

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="l-hp">Company website</label>
        <input id="l-hp" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="pt-1">
        <SubmitButton variant="gold" className="w-full py-3.5 text-base" pendingLabel="Sending…">
          Get my evaluation details
        </SubmitButton>
      </div>

      <p className="text-[11.5px] leading-relaxed text-muted">
        No account needed. By submitting, you agree we may email you about evaluating your idea -
        unsubscribe any time. We never share your idea with anyone.
      </p>
    </form>
  );
}
