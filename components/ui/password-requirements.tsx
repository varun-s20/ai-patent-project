// components/ui/password-requirements.tsx
"use client";

import { PASSWORD_RULES } from "@/lib/validation/password";
import { Check } from "@/components/ui/icons";

/** Live password-rule checklist; each rule turns emerald as it's satisfied. */
export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="mt-2.5 space-y-1.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition-colors ${
              ok ? "text-emerald-600" : "text-muted"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                ok ? "bg-emerald-100 text-emerald-600" : "bg-ink/[0.06] text-muted"
              }`}
            >
              {ok ? (
                <Check className="h-3 w-3" />
              ) : (
                <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
              )}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
