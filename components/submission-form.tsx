"use client";

import { useEffect, useState } from "react";
import { createSubmission } from "@/app/(app)/submit/actions";
import { CharacterCounter } from "@/components/ui/character-counter";
import { saveDraft, loadDraft } from "@/lib/draft/draft-storage";
import { DESCRIPTION_MIN, DESCRIPTION_MAX } from "@/lib/validation/submission";
import { INDUSTRIES } from "@/lib/types";

const EXAMPLE =
  "A golf ball with a built-in GPS chip so golfers can track lost balls";

export function SubmissionForm() {
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFields(draft);
      if (draft.description) setDescription(draft.description);
    }
  }, []);

  function persist(next: Record<string, string>) {
    setFields(next);
    saveDraft(next);
  }

  return (
    <form action={createSubmission} className="space-y-5">
      <div className="flex items-center gap-2 text-sm font-medium text-navy/60">
        <span className="text-navy">1. Describe Idea</span> ›
        <span>2. Pay</span> › <span>3. Receive Report</span>
      </div>

      <input
        name="title"
        placeholder="Invention title"
        required
        value={fields.title ?? ""}
        onChange={(e) => persist({ ...fields, title: e.target.value })}
        className="w-full rounded border p-3 text-base"
      />

      <div>
        <textarea
          name="description"
          placeholder={EXAMPLE}
          required
          rows={6}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            persist({ ...fields, description: e.target.value });
          }}
          className="w-full rounded border p-3 text-base"
        />
        <CharacterCounter count={description.length} min={DESCRIPTION_MIN} max={DESCRIPTION_MAX} />
      </div>

      <textarea
        name="problem"
        placeholder="What problem does it solve? (optional)"
        rows={3}
        value={fields.problem ?? ""}
        onChange={(e) => persist({ ...fields, problem: e.target.value })}
        className="w-full rounded border p-3 text-base"
      />

      <select
        name="industry"
        required
        value={fields.industry ?? ""}
        onChange={(e) => persist({ ...fields, industry: e.target.value })}
        className="w-full rounded border p-3 text-base"
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

      <input
        name="inventorName"
        placeholder="Inventor full name"
        required
        value={fields.inventorName ?? ""}
        onChange={(e) => persist({ ...fields, inventorName: e.target.value })}
        className="w-full rounded border p-3 text-base"
      />

      <input
        name="email"
        type="email"
        placeholder="Email address"
        required
        value={fields.email ?? ""}
        onChange={(e) => persist({ ...fields, email: e.target.value })}
        className="w-full rounded border p-3 text-base"
      />

      <button className="w-full rounded-lg bg-navy py-4 text-lg font-semibold text-white">
        Get My Report
      </button>
    </form>
  );
}
