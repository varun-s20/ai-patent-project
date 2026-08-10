import nodemailer, { type Transporter } from "nodemailer";
import { BRAND } from "@/lib/email/layout";
import { type EmailContent } from "@/lib/email/templates";

let transporter: Transporter | null = null;

// SMTP transport. Requires:
//   GMAIL_USER          — the full sending address (Gmail, Google Workspace, or
//                         any mailbox on your own domain)
//   GMAIL_APP_PASSWORD  — for Google, a 16-char App Password (Account → Security
//                         → 2-Step Verification → App passwords), NOT the login
//                         password. For other hosts, the mailbox password.
//   SMTP_HOST/SMTP_PORT — only for NON-Google mailboxes (cPanel, Zoho, M365).
//                         Unset means Google, which nodemailer resolves itself.
function getTransporter(): Transporter {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set to send email over SMTP");
    }
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 465);
    // Bounded timeouts on SMTP connection: two send sites sit on the paying
    // customer's critical path (account-welcome email before redirect, admin
    // notification before Stripe checkout), so an unreachable mail host must
    // fail fast rather than block a page transition. Callers already treat
    // send failure as non-fatal and recover gracefully.
    const timeoutConfig = {
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    };
    transporter = nodemailer.createTransport(
      host
        ? // 465 is implicit TLS; 587 is STARTTLS, which nodemailer upgrades into
          // only when `secure` is false.
          { host, port, secure: port === 465, auth: { user, pass }, ...timeoutConfig }
        : { service: "gmail", auth: { user, pass }, ...timeoutConfig },
    );
  }
  return transporter;
}

// Google rewrites the From header to the authenticated account, so on Gmail/
// Workspace this name is only the display label and the address must be
// GMAIL_USER. Other SMTP hosts generally honour whatever From you send, but
// keeping it equal to the authenticated mailbox is what keeps SPF/DMARC aligned.
export const EMAIL_FROM_NAME = BRAND;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export async function sendEmail(
  to: string,
  content: EmailContent,
  attachments?: EmailAttachment[],
): Promise<void> {
  const user = process.env.GMAIL_USER!;
  await getTransporter().sendMail({
    from: `${EMAIL_FROM_NAME} <${user}>`,
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    ...(attachments && attachments.length > 0
      ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
      : {}),
  });
}
