// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderCertificatePdf } from "@/lib/pdf/certificate-render";
import type { CertificateData } from "@/lib/certificate/types";

// Minimal valid 1×1 white PNG (IHDR+IDAT+IEND all intact) so the test needs no qrcode dependency.
const PNG_1x1 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC";

const DATA: CertificateData = {
  certId: "GC-AI-2026-8F14E4",
  title: "Self-cooling water bottle",
  inventorName: "Ada Lovelace",
  industry: "Consumer Goods",
  issuedAt: "June 9, 2026",
  verifyUrl: "https://registry.example.com/verify/GC-AI-2026-8F14E4",
  qrDataUrl: PNG_1x1,
};

describe("renderCertificatePdf", () => {
  it("produces a non-empty PDF buffer", async () => {
    const buf = await renderCertificatePdf(DATA);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  }, 20000);
});
