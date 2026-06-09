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
