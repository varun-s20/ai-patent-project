export interface EmailContent {
  subject: string;
  html: string;
  /** Plain-text alternative — multipart (html+text) email scores measurably
   * better with spam filters than HTML-only, which matters for a paid
   * product whose report/certificate email is the entire deliverable. */
  text: string;
}

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
    html: `<p>Thanks! We received your $49 payment for "<strong>${title}</strong>".</p>
<p>Our AI is now evaluating your invention across five dimensions. You'll have your results shortly.</p>`,
    text: `Thanks! We received your $49 payment for "${args.title}".\n\nOur AI is now evaluating your invention across five dimensions. You'll have your results shortly.`,
  };
}

export function evaluationFailedEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "We refunded your evaluation",
    html: `<p>We hit a problem evaluating "<strong>${title}</strong>" and have automatically refunded your $49.</p>
<p>You will not be charged for this attempt. Please try again later.</p>`,
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
    html: `<p>We hit a problem evaluating "<strong>${title}</strong>" and couldn't automatically confirm your refund.</p>
<p>Please contact support and reference this invention's title — we'll make sure your $49 is refunded.</p>`,
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
    html: `<p><strong>${inventorName}</strong> (${email}) requested a patent-attorney referral for "<strong>${title}</strong>".</p>
<p>Submission: ${args.submissionId}</p>
<p>Reply to them directly with a referral.</p>`,
    text: `${args.inventorName} (${args.email}) requested a patent-attorney referral for "${args.title}".\n\nSubmission: ${args.submissionId}\n\nReply to them directly with a referral.`,
  };
}

export function reportReadyEmail(args: { title: string; submissionId: string }): EmailContent {
  const title = escapeHtml(args.title);
  // Fails loudly rather than silently degrading to a relative, unclickable
  // link — this is the single most important link in the highest-value email.
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build the report-ready email link");
  }
  const link = `${base.replace(/\/$/, "")}/status/${args.submissionId}`;
  return {
    subject: "Your Pre-Patent Intelligence Report & Certificate are ready",
    html: `<p>Your 8-page Pre-Patent Intelligence Report for "<strong>${title}</strong>" is ready.</p>
<p>Two PDFs are attached to this email:</p>
<ul>
  <li>Your <strong>Pre-Patent Intelligence Report</strong></li>
  <li>Your <strong>Certificate of Idea Registration</strong></li>
</ul>
<p>You can also view your results and re-download both any time here:</p>
<p><a href="${link}">${link}</a></p>
<p>The report ends with our recommendation on what to do next. If it points to a patent attorney, you can request a referral from the same page.</p>
<p style="font-size:12px;color:#6B7280;margin-top:24px">These are AI-generated estimates, not legal advice. This report confers no intellectual-property rights.</p>`,
    text: `Your 8-page Pre-Patent Intelligence Report for "${args.title}" is ready.

Two PDFs are attached to this email: your Pre-Patent Intelligence Report and your Certificate of Idea Registration.

View your results and re-download both any time here: ${link}

The report ends with our recommendation on what to do next. If it points to a patent attorney, you can request a referral from the same page.

These are AI-generated estimates, not legal advice. This report confers no intellectual-property rights.`,
  };
}
