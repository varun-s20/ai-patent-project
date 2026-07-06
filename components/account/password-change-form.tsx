// components/account/password-change-form.tsx
"use client";

import { useState } from "react";
import { updatePassword } from "@/app/(app)/account/actions";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

/** Password-change form: current-password re-check, new + confirm with live
 * rule UI, match guard, and pending state. */
export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const mismatch = confirmValue.length > 0 && password !== confirmValue;

  return (
    <form
      action={updatePassword}
      className="mt-5 space-y-4"
      onSubmit={(e) => {
        if (mismatch) e.preventDefault();
      }}
    >
      <div>
        <label htmlFor="pw-current" className="text-xs uppercase tracking-[0.14em] text-muted">
          Current password
        </label>
        <PasswordField
          id="pw-current"
          name="currentPassword"
          placeholder="Current password"
          autoComplete="current-password"
          className={`mt-1.5 ${inputClass}`}
        />
      </div>
      <div>
        <label htmlFor="pw-new" className="text-xs uppercase tracking-[0.14em] text-muted">
          New password
        </label>
        <PasswordField
          id="pw-new"
          name="password"
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          className={`mt-1.5 ${inputClass}`}
          showRequirements
          onValueChange={setPassword}
        />
      </div>
      <div>
        <label htmlFor="pw-confirm" className="text-xs uppercase tracking-[0.14em] text-muted">
          Confirm password
        </label>
        <PasswordField
          id="pw-confirm"
          name="confirmPassword"
          placeholder="Re-enter new password"
          autoComplete="new-password"
          className={`mt-1.5 ${inputClass}`}
          onValueChange={setConfirmValue}
        />
      </div>
      {mismatch && <p className="text-xs text-red-600">Passwords don’t match.</p>}
      <SubmitButton variant="primary" className="w-full" pendingLabel="Updating…">
        Change password
      </SubmitButton>
    </form>
  );
}
