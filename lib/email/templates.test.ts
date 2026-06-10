import { describe, it, expect } from "vitest";
import { reportReadyEmail } from "./templates";

describe("reportReadyEmail", () => {
  it("mentions both the report and the certificate", () => {
    const email = reportReadyEmail({ title: "My Idea", submissionId: "sub-1" });
    expect(email.html).toContain("Certificate of Idea Registration");
    expect(email.html).toContain("Pre-Patent Intelligence Report");
  });

  it("escapes html in the title", () => {
    const email = reportReadyEmail({ title: "<script>", submissionId: "sub-1" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});
