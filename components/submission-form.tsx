"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmission, type SubmitState } from "@/app/(app)/submit/actions";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Spinner } from "@/components/ui/spinner";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft/draft-storage";
import { DESCRIPTION_MIN, DESCRIPTION_MAX } from "@/lib/validation/submission";
import { INDUSTRIES } from "@/lib/types";

const EXAMPLE =
  "A golf ball with a built-in GPS chip so golfers can track lost balls";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-base text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";
const labelClass = "block text-xs font-medium uppercase tracking-[0.14em] text-muted";

export function SubmissionForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [state, formAction, isPending] = useActionState<SubmitState, FormData>(
    createSubmission,
    {},
  );

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFields(draft);
      if (draft.description) setDescription(draft.description);
    }
  }, []);

  // On success, wipe the draft so the next idea starts blank, then go to payment.
  useEffect(() => {
    if (state.id) {
      clearDraft();
      router.push(`/pay/${state.id}`);
    }
  }, [state.id, router]);

  function persist(next: Record<string, string>) {
    setFields(next);
    saveDraft(next);
  }

  const busy = isPending || Boolean(state.id);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

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
          placeholder={EXAMPLE}
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
        {busy ? "Submitting…" : "Get My Report"}
      </button>
    </form>
  );
}
