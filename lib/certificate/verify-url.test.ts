import { describe, it, expect, afterEach } from "vitest";
import { certificateVerifyUrl } from "./verify-url";

describe("certificateVerifyUrl", () => {
  const original = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = original;
  });

  it("builds a /verify/<certId> url from the base url", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    expect(certificateVerifyUrl("GC-AI-2026-8F14E4")).toBe(
      "https://registry.example.com/verify/GC-AI-2026-8F14E4",
    );
  });

  it("tolerates a trailing slash on the base url", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com/";
    expect(certificateVerifyUrl("GC-AI-2026-8F14E4")).toBe(
      "https://registry.example.com/verify/GC-AI-2026-8F14E4",
    );
  });
});
