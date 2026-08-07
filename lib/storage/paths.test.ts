import { describe, it, expect } from "vitest";
import { documentPath } from "./paths";

describe("documentPath", () => {
  it("namespaces by user then submission then file type", () => {
    expect(documentPath("user-1", "sub-9", "report")).toBe("user-1/sub-9/report.pdf");
    expect(documentPath("user-1", "sub-9", "certificate")).toBe("user-1/sub-9/certificate.pdf");
  });
});
