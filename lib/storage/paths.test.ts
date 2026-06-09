import { describe, it, expect } from "vitest";
import { documentPath, assertOwnership } from "./paths";

describe("documentPath", () => {
  it("namespaces by user then submission then file type", () => {
    expect(documentPath("user-1", "sub-9", "report")).toBe("user-1/sub-9/report.pdf");
    expect(documentPath("user-1", "sub-9", "certificate")).toBe("user-1/sub-9/certificate.pdf");
  });
});

describe("assertOwnership", () => {
  it("passes when the user owns the submission", () => {
    expect(() => assertOwnership({ user_id: "u1" }, "u1")).not.toThrow();
  });

  it("throws when the user does not own the submission", () => {
    expect(() => assertOwnership({ user_id: "u1" }, "u2")).toThrow("Forbidden");
  });
});
