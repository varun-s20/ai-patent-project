"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { isValidEmail } from "@/lib/validation/email";
import { validatePassword } from "@/lib/validation/password";
import { FULL_NAME_MAX } from "@/lib/validation/profile";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

/**
 * Registration form with live, client-side gating: the Register button stays
 * disabled until the name is present, the email is well-formed, and the password
 * meets every rule. The matching checks also run in the `signUp` server action,
 * so the rules hold even if a client bypasses this. Posting still goes through
 * the server action, so the existing-account / error handling is unchanged.
 */
export function RegisterForm({
  lockedEmail,
  lockedFullName,
  claimToken,
}: {
  lockedEmail?: string;
  /** Set on the claim path only. Read-only for the same reason the email is:
   * this is the inventor name already printed on the certificate they paid
   * for (`submissions.inventor_name`, stamped at payment). Editing it here
   * would only change the account's profile name, leaving the certificate
   * saying something else — a correction has to go through the submission. */
  lockedFullName?: string;
  claimToken?: string;
} = {}) {
  const [fullName, setFullName] = useState(lockedFullName ?? "");
  const [email, setEmail] = useState(lockedEmail ?? "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");

  const emailOk = isValidEmail(email);
  const passwordOk = validatePassword(password).valid;
  const nameOk = fullName.trim().length > 0;
  const canSubmit = nameOk && emailOk && passwordOk;
  const showEmailError = emailTouched && email !== "" && !emailOk;

  return (
    <form action={signUp} className="space-y-4">
      {claimToken && <input type="hidden" name="claim" value={claimToken} />}
      <input
        name="fullName"
        placeholder="Full name"
        required
        readOnly={Boolean(lockedFullName)}
        aria-readonly={Boolean(lockedFullName)}
        maxLength={FULL_NAME_MAX}
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className={`${inputClass} ${lockedFullName ? "bg-paper text-muted" : ""}`}
      />
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          readOnly={Boolean(lockedEmail)}
          aria-readonly={Boolean(lockedEmail)}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={showEmailError}
          className={`${inputClass} ${lockedEmail ? "bg-paper text-muted" : ""}`}
        />
        {showEmailError && (
          <p className="mt-1.5 text-xs text-red-600">Enter a valid email address.</p>
        )}
      </div>
      <PasswordField
        minLength={8}
        autoComplete="new-password"
        className={inputClass}
        showRequirements
        onValueChange={setPassword}
      />
      <SubmitButton
        variant="primary"
        className="w-full"
        pendingLabel="Creating account…"
        disabled={!canSubmit}
      >
        Register
      </SubmitButton>
    </form>
  );
}
