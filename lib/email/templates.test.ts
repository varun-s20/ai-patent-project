import { describe, it, expect } from "vitest";
import { paymentConfirmationEmail, evaluationFailedEmail } from "@/lib/email/templates";

describe("email templates", () => {
  it("confirmation email includes the invention title", () => {
    const e = paymentConfirmationEmail({ title: "My Widget" });
    expect(e.subject).toMatch(/payment received/i);
    expect(e.html).toContain("My Widget");
  });

  it("failure email mentions the refund and the title", () => {
    const e = evaluationFailedEmail({ title: "My Widget" });
    expect(e.html).toMatch(/refund/i);
    expect(e.html).toContain("My Widget");
  });

  it("escapes HTML in the title", () => {
    const e = paymentConfirmationEmail({ title: "<script>x</script>" });
    expect(e.html).not.toContain("<script>");
    expect(e.html).toContain("&lt;script&gt;");
  });
});
