// lib/report/cert-id.test.ts
import { describe, it, expect } from "vitest";
import { certIdFor } from "@/lib/report/cert-id";

describe("certIdFor", () => {
  it("matches the GC-AI-YYYY-XXXXXX format and is deterministic", () => {
    const id = "8f14e45f-ceea-467b-9a36-deadbeef0001";
    expect(certIdFor(id, 2026)).toBe(certIdFor(id, 2026));
    expect(certIdFor(id, 2026)).toMatch(/^GC-AI-2026-[0-9A-F]{6}$/);
  });

  it("differs for different submissions", () => {
    expect(certIdFor("aaaaaaaa-0000-0000-0000-000000000000", 2026)).not.toBe(
      certIdFor("bbbbbbbb-0000-0000-0000-000000000000", 2026),
    );
  });
});
