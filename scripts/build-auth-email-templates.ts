/**
 * Regenerates supabase/templates/*.html from the shared email layout.
 *
 * Supabase's hosted auth emails are configured in the dashboard, not in this
 * repo — nothing here is read at runtime. These files exist so the templates
 * are version-controlled and styled by the same lib/email/layout.ts as the
 * app's own mail, instead of being hand-edited in a web textarea and drifting.
 *
 * Run:   npx tsx scripts/build-auth-email-templates.ts
 * Then:  paste each file into Supabase → Authentication → Emails.
 *
 * {{ .ConfirmationURL }} is a Go template tag Supabase substitutes when it
 * sends; it must survive into the output untouched.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { emailLayout } from "../lib/email/layout";

const OUT_DIR = new URL("../supabase/templates/", import.meta.url);

const TEMPLATES: Record<string, string> = {
  "confirm-signup.html": emailLayout({
    preheader: "Confirm your email address to activate your account.",
    heading: "Confirm your email address",
    body: `<p style="margin:0 0 14px">Thanks for creating an account. Confirm this address and you can evaluate your first invention right away.</p>
<p style="margin:0">This link expires in 24 hours and can only be used once.</p>`,
    cta: { label: "Confirm my email", href: "{{ .ConfirmationURL }}" },
    footnote:
      "If you didn't create this account, you can ignore this email — no account is activated until the link above is clicked.",
  }),
  "reset-password.html": emailLayout({
    preheader: "Reset the password on your account.",
    heading: "Reset your password",
    body: `<p style="margin:0 0 14px">We received a request to reset the password on your account. Choose a new one here:</p>
<p style="margin:0">This link expires in 1 hour and can only be used once.</p>`,
    cta: { label: "Choose a new password", href: "{{ .ConfirmationURL }}" },
    footnote:
      "If you didn't request this, you can ignore this email — your password stays as it is.",
  }),
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, html] of Object.entries(TEMPLATES)) {
  writeFileSync(new URL(name, OUT_DIR), html);
  console.log(`wrote supabase/templates/${name}`);
}
