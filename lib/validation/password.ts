// lib/validation/password.ts
export type PasswordRule = { id: string; label: string; test: (pw: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { id: "number", label: "Contains a number", test: (pw) => /[0-9]/.test(pw) },
  { id: "symbol", label: "Contains a symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export const PASSWORD_ERROR =
  "Password must be at least 8 characters and include a number and a symbol.";

export function validatePassword(pw: string): { valid: boolean; failed: string[] } {
  const failed = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.id);
  return { valid: failed.length === 0, failed };
}
