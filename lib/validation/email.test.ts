import { describe, it, expect } from "vitest";
import { isValidEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("alice@example.com")).toBe(true);
  });
  it("accepts plus-addressing and subdomains", () => {
    expect(isValidEmail("alice+tag@mail.example.co.uk")).toBe(true);
  });
  it("trims surrounding whitespace", () => {
    expect(isValidEmail("  alice@example.com  ")).toBe(true);
  });
  it("rejects a missing domain dot", () => {
    expect(isValidEmail("alice@example")).toBe(false);
  });
  it("rejects a missing @", () => {
    expect(isValidEmail("alice.example.com")).toBe(false);
  });
  it("rejects internal whitespace", () => {
    expect(isValidEmail("ali ce@example.com")).toBe(false);
  });
  it("rejects empty input", () => {
    expect(isValidEmail("")).toBe(false);
  });
});
