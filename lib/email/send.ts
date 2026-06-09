import { Resend } from "resend";
import { type EmailContent } from "@/lib/email/templates";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return resend;
}

// Resend's shared sandbox sender; swap for a verified domain in production.
export const EMAIL_FROM = "AI Invention Registry <onboarding@resend.dev>";

export async function sendEmail(to: string, content: EmailContent): Promise<void> {
  await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: content.subject,
    html: content.html,
  });
}
