import { describe, it, expect } from "vitest";
import { xShareUrl, linkedInShareUrl, whatsAppShareUrl } from "@/lib/share/share-links";

const url = "https://example.com/verify/GC-AI-2026-ABC123";
const text = 'My idea "Widget" is certified.';

describe("xShareUrl", () => {
  it("targets the X/Twitter intent endpoint with url + text encoded", () => {
    const out = xShareUrl(url, text);
    expect(out.startsWith("https://twitter.com/intent/tweet?")).toBe(true);
    expect(out).toContain(`url=${encodeURIComponent(url)}`);
    expect(out).toContain(`text=${encodeURIComponent(text)}`);
  });
});

describe("linkedInShareUrl", () => {
  it("targets the LinkedIn share-offsite endpoint with url encoded", () => {
    const out = linkedInShareUrl(url);
    expect(out.startsWith("https://www.linkedin.com/sharing/share-offsite/?")).toBe(true);
    expect(out).toContain(`url=${encodeURIComponent(url)}`);
  });
});

describe("whatsAppShareUrl", () => {
  it("targets wa.me with text and url combined and encoded", () => {
    const out = whatsAppShareUrl(url, text);
    expect(out.startsWith("https://wa.me/?text=")).toBe(true);
    expect(out).toContain(encodeURIComponent(`${text} ${url}`));
  });
});
