// app/(admin)/admin/_components/notice.tsx
import { parseNotice } from "@/lib/admin/notice";

/** Renders the outcome of the last admin action. The text is a plain text node
 * (React escapes it), never markup, so a hand-crafted `?notice=` can only put
 * words on an admin's own screen. */
export function ActionNotice({ notice }: { notice?: string }) {
  const parsed = parseNotice(notice);
  if (!parsed) return null;

  return (
    <p
      role="status"
      className={`mt-4 rounded-xl border p-3 text-sm ${
        parsed.tone === "ok"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {parsed.text}
    </p>
  );
}
