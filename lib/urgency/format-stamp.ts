// Built from UTC field getters with explicit zero-padding rather than
// slice-then-replace on toISOString(): replacing "T" (1 char) with " · " (3
// chars) shifts the string right by two, so a fixed slice(0, 19) silently
// drops the seconds and leaves a dangling colon. Field getters can't drift
// like that when an edit touches the separator.
const pad = (n: number) => String(n).padStart(2, "0");

export function formatStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const mi = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}-${mo}-${d} · ${h}:${mi}:${s} UTC`;
}
