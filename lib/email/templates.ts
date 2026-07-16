import { emailLayout } from "@/lib/email/layout";

export interface EmailContent {
  subject: string;
  html: string;
  /** Plain-text alternative — multipart (html+text) email scores measurably
   * better with spam filters than HTML-only, which matters for a paid
   * product whose report/certificate email is the entire deliverable. */
  text: string;
}

const DISCLAIMER =
  "These are AI-generated estimates, not legal advice. This report confers no intellectual-property rights.";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function paymentConfirmationEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "Payment received — your invention is being evaluated",
    html: emailLayout({
      preheader: "Your $49 payment is in. The evaluation is running now.",
      heading: "Payment received",
      body: `<p style="margin:0 0 14px">Thanks — we received your $49 payment for "<strong>${title}</strong>".</p>
<p style="margin:0">Our AI is now evaluating your invention across five dimensions. You'll have your results shortly, by email and on your dashboard.</p>`,
    }),
    text: `Thanks — we received your $49 payment for "${args.title}".\n\nOur AI is now evaluating your invention across five dimensions. You'll have your results shortly, by email and on your dashboard.`,
  };
}

export function evaluationFailedEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "We refunded your evaluation",
    html: emailLayout({
      preheader: "We hit a problem and refunded your $49 automatically.",
      heading: "We refunded your evaluation",
      body: `<p style="margin:0 0 14px">We hit a problem evaluating "<strong>${title}</strong>" and have automatically refunded your $49.</p>
<p style="margin:0">You will not be charged for this attempt. Please try again later.</p>`,
    }),
    text: `We hit a problem evaluating "${args.title}" and have automatically refunded your $49.\n\nYou will not be charged for this attempt. Please try again later.`,
  };
}

/** Sent when an evaluation fails AND the refund itself couldn't be confirmed —
 * distinct from evaluationFailedEmail so we never tell a customer they were
 * refunded when we don't actually know that's true. */
export function evaluationFailedNoRefundEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "We hit a problem with your evaluation",
    html: emailLayout({
      preheader: "Your evaluation failed and we need to confirm your refund.",
      heading: "We hit a problem with your evaluation",
      body: `<p style="margin:0 0 14px">We hit a problem evaluating "<strong>${title}</strong>" and couldn't automatically confirm your refund.</p>
<p style="margin:0">Please contact support and reference this invention's title — we'll make sure your $49 is refunded.</p>`,
    }),
    text: `We hit a problem evaluating "${args.title}" and couldn't automatically confirm your refund.\n\nPlease contact support and reference this invention's title — we'll make sure your $49 is refunded.`,
  };
}

/** Admin notification: a customer answered yes to the attorney-referral ask. */
export function attorneyRequestAdminEmail(args: {
  title: string;
  inventorName: string;
  email: string;
  submissionId: string;
}): EmailContent {
  const title = escapeHtml(args.title);
  const inventorName = escapeHtml(args.inventorName);
  const email = escapeHtml(args.email);
  return {
    subject: `Attorney referral requested — ${args.title}`,
    html: emailLayout({
      preheader: `${inventorName} wants a patent-attorney referral.`,
      heading: "Attorney referral requested",
      body: `<p style="margin:0 0 14px"><strong>${inventorName}</strong> (${email}) requested a patent-attorney referral for "<strong>${title}</strong>".</p>
<p style="margin:0 0 14px">Submission: ${escapeHtml(args.submissionId)}</p>
<p style="margin:0">Reply to them directly with a referral.</p>`,
    }),
    text: `${args.inventorName} (${args.email}) requested a patent-attorney referral for "${args.title}".\n\nSubmission: ${args.submissionId}\n\nReply to them directly with a referral.`,
  };
}

/** `hasCertificate` mirrors the evaluate-submission gate: a certificate is only
 * issued for a PROCEED_NOW verdict, so the copy must not promise one otherwise. */
export function reportReadyEmail(args: {
  title: string;
  submissionId: string;
  hasCertificate: boolean;
}): EmailContent {
  const title = escapeHtml(args.title);
  // Fails loudly rather than silently degrading to a relative, unclickable
  // link — this is the single most important link in the highest-value email.
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build the report-ready email link");
  }
  const link = `${base.replace(/\/$/, "")}/status/${args.submissionId}`;
  const attachedHtml = args.hasCertificate
    ? `<ul style="margin:0 0 14px;padding-left:20px">
  <li style="margin-bottom:6px">Your <strong>Pre-Patent Intelligence Report</strong></li>
  <li>Your <strong>Certificate of Idea Registration</strong>, date and time stamped</li>
</ul>`
    : `<p style="margin:0 0 14px">Your <strong>Pre-Patent Intelligence Report</strong> is attached.</p>`;
  const attachedText = args.hasCertificate
    ? `Two PDFs are attached to this email: your Pre-Patent Intelligence Report and your date- and time-stamped Certificate of Idea Registration.`
    : `Your Pre-Patent Intelligence Report is attached.`;
  return {
    subject: args.hasCertificate
      ? "Your Pre-Patent Intelligence Report & Certificate are ready"
      : "Your Pre-Patent Intelligence Report is ready",
    html: emailLayout({
      preheader: `Your report for "${title}" is attached and ready.`,
      heading: "Your report is ready",
      body: `<p style="margin:0 0 14px">Your 8-page Pre-Patent Intelligence Report for "<strong>${title}</strong>" is ready.</p>
${attachedHtml}
<p style="margin:0">You can view your results and re-download any time:</p>`,
      cta: { label: "View your results", href: link },
      footnote: `The report ends with our recommendation on what to do next. If it points to a patent attorney, you can request a referral from the same page.<br><br>${DISCLAIMER}`,
    }),
    text: `Your 8-page Pre-Patent Intelligence Report for "${args.title}" is ready.

${attachedText}

View your results and re-download any time here: ${link}

The report ends with our recommendation on what to do next. If it points to a patent attorney, you can request a referral from the same page.

${DISCLAIMER}`,
  };
}
