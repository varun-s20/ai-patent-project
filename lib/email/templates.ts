export interface EmailContent {
  subject: string;
  html: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function paymentConfirmationEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "Payment received — your invention is being evaluated",
    html: `<p>Thanks! We received your $49 payment for "<strong>${title}</strong>".</p>
<p>Our AI is now evaluating your invention across five dimensions. You'll have your results shortly.</p>`,
  };
}

export function evaluationFailedEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "We refunded your evaluation",
    html: `<p>We hit a problem evaluating "<strong>${title}</strong>" and have automatically refunded your $49.</p>
<p>You were not charged. Please try again later.</p>`,
  };
}

export function reportReadyEmail(args: { title: string; submissionId: string }): EmailContent {
  const title = escapeHtml(args.title);
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const link = `${base}/status/${args.submissionId}`;
  return {
    subject: "Your Pre-Patent Intelligence Report is ready",
    html: `<p>Your 8-page Pre-Patent Intelligence Report for "<strong>${title}</strong>" is ready.</p>
<p>The full report is attached as a PDF. You can also view your results and re-download it any time here:</p>
<p><a href="${link}">${link}</a></p>
<p style="font-size:12px;color:#6B7280;margin-top:24px">These are AI-generated estimates, not legal advice. This report confers no intellectual-property rights.</p>`,
  };
}
