// Formats an ISO timestamp for display on certificates and reports,
// always showing an explicit timezone (PRD 6.3 requires timezone on the cert).
export function formatTimestamp(iso: string, timeZone = "UTC"): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
  return `${formatted} ${timeZone}`;
}
