import { describe, it, expect, afterEach } from "vitest";
import {
  reportReadyEmail,
  paymentConfirmationEmail,
  evaluationFailedEmail,
  evaluationFailedNoRefundEmail,
  refundIssuedEmail,
  refundFailedAdminEmail,
} from "./templates";

describe("reportReadyEmail", () => {
  const original = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    // A plain assignment would coerce `undefined` to the literal string
    // "undefined" (process.env values are always strings) rather than
    // unsetting the key — delete it instead when it wasn't set to begin with.
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = original;
  });

  it("mentions both the report and the certificate when one was issued", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    const email = reportReadyEmail({
      title: "My Idea",
      submissionId: "sub-1",
      hasCertificate: true,
    });
    expect(email.html).toContain("Certificate of Idea Registration");
    expect(email.html).toContain("Pre-Patent Intelligence Report");
    expect(email.text).toContain("Certificate of Idea Registration");
  });

  // A certificate is only issued for PROCEED_NOW; promising one on a
  // REFINE_FIRST verdict would describe an attachment that isn't there.
  it("never promises a certificate when none was issued", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    const email = reportReadyEmail({
      title: "My Idea",
      submissionId: "sub-1",
      hasCertificate: false,
    });
    expect(email.html).not.toMatch(/certificate/i);
    expect(email.text).not.toMatch(/certificate/i);
    expect(email.subject).not.toMatch(/certificate/i);
    expect(email.html).toContain("Pre-Patent Intelligence Report");
  });

  it("escapes html in the title", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    const email = reportReadyEmail({
      title: "<script>",
      submissionId: "sub-1",
      hasCertificate: true,
    });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("throws instead of silently building a broken relative link", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(() =>
      reportReadyEmail({ title: "My Idea", submissionId: "sub-1", hasCertificate: true }),
    ).toThrow();
  });
});

describe("paymentConfirmationEmail", () => {
  it("escapes html in the title and provides a text alternative", () => {
    const email = paymentConfirmationEmail({ title: "<b>Idea</b>" });
    expect(email.html).toContain("&lt;b&gt;Idea&lt;/b&gt;");
    expect(email.text).toContain("<b>Idea</b>");
  });
});

describe("evaluationFailedEmail", () => {
  it("mentions the refund, provides a text alternative, and doesn't contradict itself", () => {
    const email = evaluationFailedEmail({ title: "My Idea" });
    expect(email.html).toContain("refunded");
    expect(email.text).toContain("refunded");
    // Must never claim both "refunded" and "not charged" in the same message.
    expect(email.text).not.toMatch(/not charged/i);
  });
});

describe("evaluationFailedNoRefundEmail", () => {
  it("never claims a refund happened", () => {
    const email = evaluationFailedNoRefundEmail({ title: "My Idea" });
    expect(email.html).not.toMatch(/refunded your/i);
    expect(email.text).toContain("contact support");
  });
});

describe("refundIssuedEmail", () => {
  it("confirms the refund and sets the bank-delay expectation", () => {
    const email = refundIssuedEmail({ title: "My Idea" });
    expect(email.text).toContain("refunded");
    expect(email.text).toMatch(/5 to 10 business days/);
  });

  // A manual refund is usually goodwill on a submission that ran fine, so this
  // must never repeat evaluationFailedEmail's "we hit a problem" framing.
  it("never blames a failed evaluation", () => {
    const email = refundIssuedEmail({ title: "My Idea" });
    expect(email.html).not.toMatch(/fail|problem/i);
    expect(email.text).not.toMatch(/fail|problem/i);
  });

  it("escapes html in the title", () => {
    const email = refundIssuedEmail({ title: "<script>" });
    expect(email.html).not.toContain("<script>");
  });
});

describe("refundFailedAdminEmail", () => {
  const args = {
    title: "My Idea",
    email: "customer@example.com",
    submissionId: "sub-1",
    reason: "No such payment_intent: pi_123",
  };

  it("carries everything needed to refund by hand", () => {
    const email = refundFailedAdminEmail(args);
    expect(email.text).toContain("customer@example.com");
    expect(email.text).toContain("sub-1");
    expect(email.text).toContain("No such payment_intent: pi_123");
  });

  it("states plainly that the customer has NOT been refunded", () => {
    const email = refundFailedAdminEmail(args);
    expect(email.text).toMatch(/NOT been refunded/);
    expect(email.subject).toMatch(/ACTION NEEDED/);
  });

  it("escapes html in the title and the Stripe reason", () => {
    const email = refundFailedAdminEmail({ ...args, title: "<script>", reason: "<img onerror>" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img onerror>");
  });
});
