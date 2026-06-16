// lib/validation/password.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword, PASSWORD_RULES } from "./password";

describe("validatePassword", () => {
  it("accepts 8+ chars with a number and a symbol", () => {
    expect(validatePassword("abcd123!").valid).toBe(true);
  });
  it("rejects when too short", () => {
    const r = validatePassword("a1!");
    expect(r.valid).toBe(false);
    expect(r.failed).toContain("length");
  });
  it("rejects when missing a number", () => {
    const r = validatePassword("abcdefg!");
    expect(r.failed).toContain("number");
  });
  it("rejects when missing a symbol", () => {
    const r = validatePassword("abcdefg1");
    expect(r.failed).toContain("symbol");
  });
  it("exposes three rules with id/label/test", () => {
    expect(PASSWORD_RULES.map((r) => r.id)).toEqual(["length", "number", "symbol"]);
  });
});
