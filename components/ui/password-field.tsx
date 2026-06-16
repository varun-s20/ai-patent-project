"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/components/ui/icons";
import { PasswordRequirements } from "@/components/ui/password-requirements";

/**
 * Password input with a show/hide toggle. The eye button only flips the input
 * type client-side — the field still posts under `name` in the surrounding form,
 * so server actions are unaffected. When `showRequirements` is set, the live
 * rule checklist renders below and the field tracks its own value to drive it.
 */
export function PasswordField({
  name = "password",
  placeholder = "Password",
  required = true,
  minLength,
  className = "",
  autoComplete,
  showRequirements = false,
  onValueChange,
}: {
  name?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  autoComplete?: string;
  showRequirements?: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState("");
  const id = useId();

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onValueChange?.(e.target.value);
          }}
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
      {showRequirements && <PasswordRequirements value={value} />}
    </div>
  );
}
