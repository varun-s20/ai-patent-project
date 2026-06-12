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

const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
const info = await t.sendMail({
  from: `AI Invention Registry <${GMAIL_USER}>`,
  to,
  subject: "Gmail SMTP test ✓",
  html: "<p>If you can read this, Gmail SMTP works.</p>",
});
console.log("Sent:", info.messageId, "→", to);
