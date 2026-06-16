"use client";

import { useState } from "react";
import { signUp } from "@/app/auth/actions";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { isValidEmail } from "@/lib/validation/email";
import { validatePassword } from "@/lib/validation/password";

const inputClass =
  "w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-ink outline-none transition-colors duration-200 placeholder:text-muted/60 focus:border-gold focus:bg-card";

/**
 * Registration form with live, client-side gating: the Register button stays
 * disabled until the name is present, the email is well-formed, and the password
 * meets every rule. The matching checks also run in the `signUp` server action,
 * so the rules hold even if a client bypasses this. Posting still goes through
 * the server action, so the existing-account / error handling is unchanged.
 */
export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");

  const emailOk = isValidEmail(email);
  const passwordOk = validatePassword(password).valid;
  const nameOk = fullName.trim().length > 0;
  const canSubmit = nameOk && emailOk && passwordOk;
  const showEmailError = emailTouched && email !== "" && !emailOk;

  return (
    <form action={signUp} className="space-y-4">
      <input
        name="fullName"
        placeholder="Full name"
        required
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className={inputClass}
      />
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={showEmailError}
          className={inputClass}
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
