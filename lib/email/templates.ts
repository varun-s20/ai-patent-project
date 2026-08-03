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

/** Sent when an admin issues a refund by hand from the console. Deliberately
 * says nothing about the evaluation failing — a manual refund is usually goodwill
 * on a submission that ran fine, so evaluationFailedEmail's copy would be wrong. */
export function refundIssuedEmail(args: { title: string }): EmailContent {
  const title = escapeHtml(args.title);
  return {
    subject: "We've refunded your $49",
    html: emailLayout({
      preheader: "Your $49 is on its way back to your original payment method.",
      heading: "We've refunded your $49",
      body: `<p style="margin:0 0 14px">We've refunded the $49 you paid for "<strong>${title}</strong>".</p>
<p style="margin:0 0 14px">The money goes back to the card you paid with. Banks usually take 5 to 10 business days to show it.</p>
<p style="margin:0">If anything about this looks wrong, just reply to this email.</p>`,
    }),
    text: `We've refunded the $49 you paid for "${args.title}".\n\nThe money goes back to the card you paid with. Banks usually take 5 to 10 business days to show it.\n\nIf anything about this looks wrong, just reply to this email.`,
  };
}

/** Admin alert: the automatic refund after a failed evaluation was refused by
 * Stripe. The customer has been told to contact support and is out $49 until
 * someone acts, so this must reach a human rather than only a server log. */
export function refundFailedAdminEmail(args: {
  title: string;
  email: string;
  submissionId: string;
  reason: string;
}): EmailContent {
  const title = escapeHtml(args.title);
  const email = escapeHtml(args.email);
  return {
    subject: `ACTION NEEDED: auto-refund failed — ${args.title}`,
    html: emailLayout({
      preheader: `A customer was charged $49, the evaluation failed, and the refund did not go through.`,
      heading: "Auto-refund failed",
      body: `<p style="margin:0 0 14px">The evaluation for "<strong>${title}</strong>" failed and the automatic refund was refused by Stripe. The customer has been charged $49 and has <strong>not</strong> been refunded.</p>
<p style="margin:0 0 14px">Customer: ${email}<br>Submission: ${escapeHtml(args.submissionId)}</p>
<p style="margin:0 0 14px">Stripe said: ${escapeHtml(args.reason)}</p>
<p style="margin:0">They have been emailed to contact support. Refund them from the admin console, or directly in Stripe.</p>`,
    }),
    text: `The evaluation for "${args.title}" failed and the automatic refund was refused by Stripe. The customer has been charged $49 and has NOT been refunded.\n\nCustomer: ${args.email}\nSubmission: ${args.submissionId}\n\nStripe said: ${args.reason}\n\nThey have been emailed to contact support. Refund them from the admin console, or directly in Stripe.`,
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

/**
 * Sent the moment someone submits the ad landing-page form (/patent-idea-check).
 * This is a marketing send rather than transactional, so it carries an explicit
 * opt-out line — a reply we honour by hand, which is a real mechanism and
 * cheaper than a one-click endpoint nobody has needed yet.
 * ponytail: swap the reply-to-unsubscribe for a token link if volume makes
 * hand-processing painful.
 */
export function leadWelcomeEmail(args: { fullName: string }): EmailContent {
  const firstName = escapeHtml(args.fullName.split(/\s+/)[0] ?? args.fullName);
  // Same rule as reportReadyEmail: fail loudly rather than send the one email
  // in this flow whose whole job is the link, with a dead relative link in it.
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set — cannot build the lead welcome email link");
  }
  const link = `${base.replace(/\/$/, "")}/submit`;
  return {
    subject: "Your idea evaluation — here's what happens next",
    html: emailLayout({
      preheader: "Three steps, minutes, $49. Here's how the evaluation works.",
      heading: `Thanks, ${firstName}`,
      body: `<p style="margin:0 0 14px">We got your details. Here's exactly how an evaluation runs:</p>
<ol style="margin:0 0 14px;padding-left:20px">
  <li style="margin-bottom:6px">You describe your invention — as much detail as you're comfortable sharing.</li>
  <li style="margin-bottom:6px">You pay <strong>$49</strong>. A patent attorney charges up to $10,000 for the same read.</li>
  <li>Within minutes you get your Pre-Patent Intelligence Report, scored across five dimensions, plus a timestamped Certificate of Idea Registration if the verdict supports it.</li>
</ol>
<p style="margin:0">Your idea stays private. We never share it, and we never file on it.</p>`,
      cta: { label: "Start your $49 evaluation", href: link },
      footnote: `You're getting this because you asked us about evaluating your invention. Don't want any more email from us? Reply with "unsubscribe" and we'll delete your details.<br><br>${DISCLAIMER}`,
    }),
    text: `Thanks, ${args.fullName.split(/\s+/)[0] ?? args.fullName}.

We got your details. Here's exactly how an evaluation runs:

1. You describe your invention — as much detail as you're comfortable sharing.
2. You pay $49. A patent attorney charges up to $10,000 for the same read.
3. Within minutes you get your Pre-Patent Intelligence Report, scored across five dimensions, plus a timestamped Certificate of Idea Registration if the verdict supports it.

Your idea stays private. We never share it, and we never file on it.

Start your $49 evaluation: ${link}

You're getting this because you asked us about evaluating your invention. Don't want any more email from us? Reply with "unsubscribe" and we'll delete your details.

${DISCLAIMER}`,
  };
}

/** Admin notification: a new landing-page lead, with the campaign that paid for
 * it so ad spend can be judged against the leads it actually produced. */
export function leadNotifyAdminEmail(args: {
  fullName: string;
  email: string;
  phone: string | null;
  stage: string;
  patentType: string;
  campaign: string | null;
  source: string | null;
}): EmailContent {
  const rows: [string, string][] = [
    ["Name", args.fullName],
    ["Email", args.email],
    ["Phone", args.phone ?? "not given"],
    ["Wants", args.patentType],
    ["Stage", args.stage],
    ["Source", args.source ?? "direct / unknown"],
    ["Campaign", args.campaign ?? "none"],
  ];
  const html = rows
    .map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
    .join("<br>");
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  return {
    subject: `New lead — ${args.fullName} (${args.stage})`,
    html: emailLayout({
      preheader: `${args.fullName} asked about an evaluation.`,
      heading: "New landing-page lead",
      body: `<p style="margin:0 0 14px">${html}</p>
<p style="margin:0">They've had the welcome email. Reply to them directly, then mark them contacted in the console.</p>`,
    }),
    text: `New landing-page lead.\n\n${text}\n\nThey've had the welcome email. Reply to them directly, then mark them contacted in the console.`,
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
