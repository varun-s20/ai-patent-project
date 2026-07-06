import { describe, it, expect, afterEach } from "vitest";
import {
  reportReadyEmail,
  paymentConfirmationEmail,
  evaluationFailedEmail,
  evaluationFailedNoRefundEmail,
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

  it("mentions both the report and the certificate", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    const email = reportReadyEmail({ title: "My Idea", submissionId: "sub-1" });
    expect(email.html).toContain("Certificate of Idea Registration");
    expect(email.html).toContain("Pre-Patent Intelligence Report");
    expect(email.text).toContain("Certificate of Idea Registration");
  });

  it("escapes html in the title", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://registry.example.com";
    const email = reportReadyEmail({ title: "<script>", submissionId: "sub-1" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("throws instead of silently building a broken relative link", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    expect(() => reportReadyEmail({ title: "My Idea", submissionId: "sub-1" })).toThrow();
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
