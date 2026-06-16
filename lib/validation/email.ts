// lib/validation/email.ts
/**
 * Pragmatic email-format check: a local part, one `@`, and a dotted domain,
 * with no whitespace. Deliberately not RFC-exhaustive — it mirrors the intent
 * of the browser's `type="email"` validation so client and server agree.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_ERROR = "Enter a valid email address.";

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
