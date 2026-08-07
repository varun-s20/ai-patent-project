import { describe, expect, it } from "vitest";
import { sanitizeSearch } from "@/lib/admin/search";

describe("sanitizeSearch", () => {
  it("passes an ordinary search through", () => {
    expect(sanitizeSearch("solar panel")).toBe("solar panel");
    expect(sanitizeSearch("  ada@example.com  ")).toBe("ada@example.com");
  });

  // These are parsed structurally inside PostgREST's `or(...)`, so leaving
  // them in lets a search string reshape the filter rather than filter by it.
  it("strips PostgREST filter syntax", () => {
    expect(sanitizeSearch("a,b")).toBe("a b");
    expect(sanitizeSearch("(x)")).toBe("x");
    expect(sanitizeSearch("a*b")).toBe("a b");
    expect(sanitizeSearch("a\\b")).toBe("a b");
  });

  // ilike wildcards: searching "50%" used to match every title, which reads as
  // a broken search rather than an empty result.
  it("strips ilike wildcards", () => {
    expect(sanitizeSearch("50%")).toBe("50");
    expect(sanitizeSearch("a_b")).toBe("a b");
  });

  it("treats no query as an empty search", () => {
    expect(sanitizeSearch(undefined)).toBe("");
    expect(sanitizeSearch("")).toBe("");
    expect(sanitizeSearch("   ")).toBe("");
  });
});
