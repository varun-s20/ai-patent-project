// Quick Gmail SMTP smoke test.
// Usage: node scripts/test-email.mjs you@somewhere.com
// Reads GMAIL_USER / GMAIL_APP_PASSWORD from .env.local.
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const to = process.argv[2] || process.env.GMAIL_USER;
const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error("Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local first.");
  process.exit(1);
}

// Mirrors lib/email/send.ts: SMTP_HOST set = custom mailbox, unset = Google.
const auth = { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD };
const port = Number(process.env.SMTP_PORT ?? 465);
const t = nodemailer.createTransport(
  process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port, secure: port === 465, auth }
    : { service: "gmail", auth },
);
const info = await t.sendMail({
  from: `AI Patent Register <${GMAIL_USER}>`,
  to,
  subject: "SMTP test ✓",
  html: "<p>If you can read this, SMTP works.</p>",
});
console.log("Sent:", info.messageId, "→", to);
