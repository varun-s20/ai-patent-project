// components/account/password-change-form.tsx
"use client";

import { useState } from "react";
import { updatePassword } from "@/app/(app)/account/actions";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

/** Password-change form: new + confirm with live rule UI, match guard, and pending state. */
export function PasswordChangeForm() {
  const [mismatch, setMismatch] = useState(false);

  return (
    <form
      action={updatePassword}
      className="mt-5 space-y-4"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const pw = (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "";
        const cf = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ?? "";
        if (pw !== cf) {
          e.preventDefault();
          setMismatch(true);
        } else {
          setMismatch(false);
        }
      }}
    >
      <div>
        <label className="text-xs uppercase tracking-[0.14em] text-muted">New password</label>
        <PasswordField
          name="password"
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          className={`mt-1.5 ${inputClass}`}
          showRequirements
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.14em] text-muted">Confirm password</label>
        <PasswordField
          name="confirmPassword"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>
      {mismatch && <p className="text-xs text-red-600">Passwords don’t match.</p>}
      <SubmitButton variant="primary" className="w-full" pendingLabel="Updating…">
        Change password
      </SubmitButton>
    </form>
  );
}
