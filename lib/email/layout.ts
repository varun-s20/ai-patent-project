/** Brand + chrome for every outbound email.
 *
 * Email clients strip <style> blocks and ignore flexbox/grid, so this is
 * deliberately table-based with inline styles only — the same palette as the
 * site (globals.css) and the PDFs (lib/pdf/theme.ts), restated here because
 * neither of those is reachable from an email client.
 *
 * send.ts imports BRAND from here rather than the reverse: send.ts already
 * imports templates.ts, which imports this file.
 */
export const BRAND = process.env.EMAIL_FROM_NAME ?? "AI Patent Register";

const NAVY = "#1A2B4A";
const GOLD = "#C8A020";
const INK = "#1F2937";
const MUTED = "#6B7280";
const LINE = "#E2E8F0";
const PAPER = "#F6F7F9";

export interface LayoutArgs {
  /** The grey line clients show next to the subject in the inbox list. */
  preheader: string;
  heading: string;
  /** Body HTML — <p>/<ul> fragments. Already escaped by the caller. */
  body: string;
  cta?: { label: string; href: string };
  /** Small print under the rule. Omitted for internal/admin mail. */
  footnote?: string;
}

/** A gold button that still reads as a button in Outlook, which drops
 * background-color on <a> — hence the bgcolor on the wrapping table cell. */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
  <tr>
    <td bgcolor="${GOLD}" style="border-radius:8px">
      <a href="${href}" style="display:inline-block;padding:12px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${NAVY};text-decoration:none;border-radius:8px">${label}</a>
    </td>
  </tr>
</table>`;
}

export function emailLayout(args: LayoutArgs): string {
  const font = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAPER}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${args.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};padding:32px 12px">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border:1px solid ${LINE};border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:${NAVY};border-bottom:3px solid ${GOLD};padding:20px 32px">
            <span style="font-family:${font};font-size:13px;font-weight:700;letter-spacing:1.5px;color:#FFFFFF;text-transform:uppercase">${BRAND}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="margin:0 0 16px;font-family:${font};font-size:21px;font-weight:600;line-height:1.3;color:${NAVY}">${args.heading}</h1>
            <div style="font-family:${font};font-size:15px;line-height:1.6;color:${INK}">${args.body}</div>
            ${args.cta ? button(args.cta.label, args.cta.href) : ""}
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid ${LINE};background:#FFFFFF;padding:20px 32px">
            ${args.footnote ? `<p style="margin:0 0 10px;font-family:${font};font-size:12px;line-height:1.5;color:${MUTED}">${args.footnote}</p>` : ""}
            <p style="margin:0;font-family:${font};font-size:12px;color:${MUTED}">${BRAND}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
