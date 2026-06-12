import nodemailer, { type Transporter } from "nodemailer";
import { type EmailContent } from "@/lib/email/templates";

let transporter: Transporter | null = null;

// Gmail SMTP transport. Requires:
//   GMAIL_USER          — your full Gmail address (e.g. you@gmail.com)
//   GMAIL_APP_PASSWORD  — a 16-char App Password (Google Account → Security →
//                         2-Step Verification → App passwords). NOT your login
//                         password; that won't work.
function getTransporter(): Transporter {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      throw new Error(
        "GMAIL_USER and GMAIL_APP_PASSWORD must be set to send email via Gmail SMTP",
      );
    }
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

// Gmail rewrites the From header to the authenticated account, so this name is
// just the display label; the address must be the GMAIL_USER account.
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME ?? "AI Invention Registry";

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
    ...(attachments && attachments.length > 0
      ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
      : {}),
  });
}
