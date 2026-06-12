"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/components/ui/icons";

/**
 * Password input with a show/hide toggle. The eye button only flips the input
 * type client-side — the field still posts under `name` in the surrounding form,
 * so server actions are unaffected.
 */
export function PasswordField({
  name = "password",
  placeholder = "Password",
  required = true,
  minLength,
  className = "",
  autoComplete,
}: {
  name?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  autoComplete?: string;
}) {
  const [shown, setShown] = useState(false);
  const id = useId();

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={shown ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted/70 transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none"
        tabIndex={-1}
      >
        {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
