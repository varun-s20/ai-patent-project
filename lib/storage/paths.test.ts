import { describe, expect, it } from "vitest";
import { documentPath } from "@/lib/storage/paths";

describe("documentPath", () => {
  // Keyed on the submission, never the owner: the PDFs for a payment-first
  // submission are generated before anyone owns it, and the owner can change
  // once — at claim time. A path with a user id in it would be wrong in both
  // cases, and the storage policy would then deny the real owner.
  it("namespaces by submission id", () => {
    expect(documentPath("sub-1", "report")).toBe("sub-1/report.pdf");
    expect(documentPath("sub-1", "certificate")).toBe("sub-1/certificate.pdf");
  });
});
