// components/start/idea-form.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { startEvaluation, type StartState } from "@/app/(landing)/patent-idea-check/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { CharacterCounter } from "@/components/ui/character-counter";
import { CountrySelect } from "@/components/ui/country-select";
import { INDUSTRIES } from "@/lib/types";
import { FULL_NAME_MAX, HONEYPOT_FIELD, PHONE_MAX } from "@/lib/validation/lead";
import { DESCRIPTION_MIN, TITLE_MAX } from "@/lib/validation/submission";

/** Ad attribution, straight off the landing URL. Declared here rather than in
 * start-panel.tsx because this is the component that posts these fields — and
 * because start-panel imports this module, so the reverse would be a cycle. */
export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPath: string;
}

const inputClass =
  "w-full rounded-xl border bg-paper/50 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:bg-card";
const okClass = "border-line focus:border-gold";
const badClass = "border-red-400 bg-red-50/60 focus:border-red-500";
const labelClass = "block text-[11px] font-medium uppercase tracking-[0.16em] text-muted";

export function IdeaForm({
  attribution,
  defaultEmail,
  onTitleChange,
  onNameChange,
}: {
  attribution: Attribution;
  /** Prefills the email field — not readOnly, since a logged-in visitor may
   * still want to submit this particular idea under a different address. */
  defaultEmail?: string;
  onTitleChange: (value: string) => void;
  onNameChange: (value: string) => void;
}) {
  const [state, formAction] = useActionState<StartState, FormData>(startEvaluation, {});
  const referrerRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Every field is controlled on purpose: React 19 resets a <form action={…}>
  // once the action returns, which wiped an entire hand-written invention
  // description whenever validation failed. Controlled values are re-rendered
  // from state after that reset, so a rejected submit keeps everything typed.
  const [fields, setFields] = useState<Record<string, string>>({
    email: defaultEmail ?? "",
  });
  const set = (name: string) => (value: string) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const errors = state.fieldErrors ?? {};

  // document.referrer only exists in the browser — the one attribution signal
  // the server can't read off the URL.
  useEffect(() => {
    if (referrerRef.current) referrerRef.current.value = document.referrer;
  }, []);

  // The banner sits at the top of a form that runs well past the fold, so a
  // rejected submit further down was invisible — the visitor just clicked
  // again. Jump to the first offending field instead. Depends on `state`
  // itself, not on its contents, so a second identical failure re-fires.
  useEffect(() => {
    if (!state.error && !state.fieldErrors) return;
    const target =
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? formRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target !== formRef.current) target?.focus({ preventScroll: true });
  }, [state]);

  /** Field wiring shared by every text input and textarea: controlled value,
   * error styling, and the aria plumbing that points a screen reader at the
   * message under the field. */
  function bind(name: string) {
    const invalid = !!errors[name];
    return {
      name,
      value: fields[name] ?? "",
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `${name}-error` : undefined,
      className: `mt-1.5 ${inputClass} ${invalid ? badClass : okClass}`,
    };
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3.5">
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="s-name" className={labelClass}>Full name</label>
        <input
          id="s-name" required maxLength={FULL_NAME_MAX}
          autoComplete="name" placeholder="Your full name"
          {...bind("fullName")}
          onChange={(e) => {
            set("fullName")(e.target.value);
            onNameChange(e.target.value);
          }}
        />
        <FieldError name="fullName" message={errors.fullName} />
      </div>

      <div>
        <label htmlFor="s-email" className={labelClass}>Email</label>
        <input
          id="s-email" type="email" required autoComplete="email"
          placeholder="you@example.com"
          {...bind("email")}
          onChange={(e) => set("email")(e.target.value)}
        />
        <FieldError name="email" message={errors.email} />
        <p className="mt-1 text-[11px] text-muted">
          Your report, certificate and receipt all go here — check it now.
        </p>
      </div>

      <div>
        <label htmlFor="s-phone" className={labelClass}>Phone</label>
        <div className="mt-1.5 flex gap-2">
          <CountrySelect name="country" />
          <input
            id="s-phone" type="tel" required maxLength={PHONE_MAX}
            autoComplete="tel" placeholder="Your number"
            {...bind("phone")}
            onChange={(e) => set("phone")(e.target.value)}
            className={`min-w-0 flex-1 ${inputClass} ${errors.phone ? badClass : okClass}`}
          />
        </div>
        {/* A bad country and a bad number are the same problem to the visitor:
            the pair doesn't agree. Both land under the one row. */}
        <FieldError name="phone" message={errors.phone ?? errors.country} />
      </div>

      <div>
        <label htmlFor="s-title" className={labelClass}>What is it called?</label>
        <input
          id="s-title" required maxLength={TITLE_MAX}
          placeholder="A short name for your invention"
          {...bind("title")}
          onChange={(e) => {
            set("title")(e.target.value);
            onTitleChange(e.target.value);
          }}
        />
        <FieldError name="title" message={errors.title} />
      </div>

      <div>
        <label htmlFor="s-description" className={labelClass}>Describe it</label>
        <textarea
          id="s-description" required rows={5}
          placeholder="What it is, how it works, what makes it different. The more detail, the sharper your evaluation."
          {...bind("description")}
          onChange={(e) => set("description")(e.target.value)}
        />
        {/* The 100-character minimum was only discoverable by failing a
            submit. Show the count while it's still fixable. */}
        <CharacterCounter count={(fields.description ?? "").length} min={DESCRIPTION_MIN} />
        <FieldError name="description" message={errors.description} />
      </div>

      <div>
        <label htmlFor="s-problem" className={labelClass}>What problem does it solve?</label>
        <textarea
          id="s-problem" rows={3}
          placeholder="Optional, but it sharpens the commercial read."
          {...bind("problem")}
          onChange={(e) => set("problem")(e.target.value)}
        />
        <FieldError name="problem" message={errors.problem} />
      </div>

      <div>
        <label htmlFor="s-industry" className={labelClass}>Industry</label>
        <select
          id="s-industry" required
          {...bind("industry")}
          onChange={(e) => set("industry")(e.target.value)}
        >
          <option value="" disabled>Select one</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
        <FieldError name="industry" message={errors.industry} />
      </div>

      <input type="hidden" name="utmSource" value={attribution.utmSource ?? ""} />
      <input type="hidden" name="utmMedium" value={attribution.utmMedium ?? ""} />
      <input type="hidden" name="utmCampaign" value={attribution.utmCampaign ?? ""} />
      <input type="hidden" name="utmTerm" value={attribution.utmTerm ?? ""} />
      <input type="hidden" name="utmContent" value={attribution.utmContent ?? ""} />
      <input type="hidden" name="landingPath" value={attribution.landingPath} />
      <input ref={referrerRef} type="hidden" name="referrer" defaultValue="" />

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="s-hp">Company website</label>
        <input id="s-hp" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="pt-1">
        <SubmitButton variant="gold" className="w-full py-3.5 text-base" pendingLabel="Opening checkout…">
          Evaluate for $49
        </SubmitButton>
      </div>

      <p className="text-[11.5px] leading-relaxed text-muted">
        Your idea is registered the moment you pay — not when the report finishes. No account
        needed to start. We never share your idea with anyone.
      </p>
    </form>
  );
}

/** The one message under a rejected field. `id` matches the field's
 * aria-describedby, so a screen reader reads it as part of the control. */
function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="mt-1 text-[12px] font-medium text-red-700">
      {message}
    </p>
  );
}
