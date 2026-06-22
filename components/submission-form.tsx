"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSubmission,
  updateSubmission,
  type SubmitState,
} from "@/app/(app)/submit/actions";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDown, ShieldCheck } from "@/components/ui/icons";
import { clearDraft } from "@/lib/draft/draft-storage";
import { DESCRIPTION_MIN, DESCRIPTION_MAX } from "@/lib/validation/submission";
import { INDUSTRIES } from "@/lib/types";
import { EXAMPLE_SUBMISSION } from "@/lib/content/example-submission";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";
const labelClass = "block text-xs font-medium uppercase tracking-[0.14em] text-muted";

export function SubmissionForm({
  editId,
  initialValues,
  userEmail,
}: {
  editId?: string;
  initialValues?: Record<string, string>;
  userEmail?: string;
} = {}) {
  const isEdit = Boolean(editId);
  const [showExample, setShowExample] = useState(false);
  const router = useRouter();
  // Edit mode binds the submission id so the action keeps the (prev, formData)
  // shape useActionState needs; it redirects to the dashboard on success.
  const action = isEdit ? updateSubmission.bind(null, editId!) : createSubmission;
  const [description, setDescription] = useState(initialValues?.description ?? "");
  // A fresh form prefills only the report email with the logged-in address;
  // every other field stays blank until typed (or restored from a draft).
  const [fields, setFields] = useState<Record<string, string>>(
    initialValues ?? (userEmail ? { email: userEmail } : {}),
  );
  const [state, formAction, isPending] = useActionState<SubmitState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    // A new evaluation always starts blank except the prefilled email — we no
    // longer restore a draft. Purge any legacy draft so a previous session's
    // answers (inventor name, industry, …) can never resurface here.
    if (!isEdit) clearDraft();
  }, [isEdit]);

  // On a successful create, clear the in-memory field state so the form never
  // carries one idea's content into the next, then go to payment. (Edit mode
  // redirects server-side, so there's no state.id to react to.)
  useEffect(() => {
    if (state.id) {
      setFields({});
      setDescription("");
      router.push(`/pay/${state.id}`);
    }
  }, [state.id, router]);

  // Field state is in-memory only — nothing is persisted between visits.
  function persist(next: Record<string, string>) {
    setFields(next);
  }

  const busy = isPending || Boolean(state.id);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {/* Input-quality nudge: more detail = a sharper read, and it all stays private. */}
      <div className="rounded-xl border border-line bg-paper/50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/[0.12] ring-1 ring-gold/25">
            <ShieldCheck className="h-4 w-4 text-gold" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">
              The more you tell us, the sharper your evaluation.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Describe how it works, what&apos;s new, and who it&apos;s for. Add as much as
              you&apos;re comfortable sharing — every detail counts, and it all stays
              private and confidential.
            </p>
            <button
              type="button"
              onClick={() => setShowExample((v) => !v)}
              aria-expanded={showExample}
              className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium text-gold underline-offset-2 hover:underline"
            >
              {showExample ? "Hide example" : "See a strong example"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  showExample ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {showExample && (
          <div className="mt-4 space-y-3 rounded-lg border border-line bg-card p-4">
            <ExampleField label="Invention title" value={EXAMPLE_SUBMISSION.title} />
            <ExampleField label="Description" value={EXAMPLE_SUBMISSION.description} />
            <ExampleField label="Problem it solves" value={EXAMPLE_SUBMISSION.problem} />
            <p className="text-[11px] text-muted">
              An example of the detail that scores well — write yours in your own words.
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="f-title" className={labelClass}>
          Invention title
        </label>
        <input
          id="f-title"
          name="title"
          placeholder="Invention title"
          required
          value={fields.title ?? ""}
          onChange={(e) => persist({ ...fields, title: e.target.value })}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="f-description" className={labelClass}>
          Description — what is it and how does it work?
        </label>
        <textarea
          id="f-description"
          name="description"
          placeholder={EXAMPLE_SUBMISSION.description}
          required
          rows={6}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            persist({ ...fields, description: e.target.value });
          }}
          className={`mt-1.5 ${inputClass}`}
        />
        <CharacterCounter count={description.length} min={DESCRIPTION_MIN} max={DESCRIPTION_MAX} />
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          A few detailed sentences works best — how it works, what makes it new, and the
          problem it solves.
        </p>
      </div>

      <div>
        <label htmlFor="f-problem" className={labelClass}>
          Problem it solves (optional)
        </label>
        <textarea
          id="f-problem"
          name="problem"
          placeholder="What problem does it solve? (optional)"
          rows={3}
          value={fields.problem ?? ""}
          onChange={(e) => persist({ ...fields, problem: e.target.value })}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="f-industry" className={labelClass}>
          Industry / category
        </label>
        <select
          id="f-industry"
          name="industry"
          required
          value={fields.industry ?? ""}
          onChange={(e) => persist({ ...fields, industry: e.target.value })}
          className={`mt-1.5 ${inputClass}`}
        >
          <option value="" disabled>
            Select industry / category
          </option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-inventor" className={labelClass}>
          Inventor full name
        </label>
        <input
          id="f-inventor"
          name="inventorName"
          placeholder="Inventor full name"
          required
          value={fields.inventorName ?? ""}
          onChange={(e) => persist({ ...fields, inventorName: e.target.value })}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="f-email" className={labelClass}>
          Email — where we send your report
        </label>
        <input
          id="f-email"
          name="email"
          type="email"
          placeholder="Email address"
          required
          value={fields.email ?? ""}
          onChange={(e) => persist({ ...fields, email: e.target.value })}
          className={`mt-1.5 ${inputClass}`}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className="inline-flex w-full select-none items-center justify-center rounded-full bg-ink py-4 text-base font-medium text-cream transition-transform duration-300 ease-[var(--ease-out)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {busy && <Spinner className="mr-2 h-5 w-5" />}
        {busy ? "Saving…" : isEdit ? "Save changes" : "Get My Report"}
      </button>
    </form>
  );
}

/** One read-only line of the worked example shown under "See a strong example". */
function ExampleField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{value}</p>
    </div>
  );
}
