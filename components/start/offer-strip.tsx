import { Certificate, Check, FileText, ShieldCheck } from "@/components/ui/icons";
import { REFUND_LINE, SECURE_LINE } from "@/lib/offer";

/**
 * The receipt strip under the page's own pitch: what arrives, and the two
 * reasons a hesitating buyer gives for not paying.
 *
 * It sits in the left column rather than only beside the button because the
 * form's copy is out of view on a phone by the time the page has been read —
 * and because the two payment promises were the one thing neither landing
 * column said anywhere. Deliverables are deliberately the documents only: the
 * five dimensions are already named in both pages' intro prose, and a fourth
 * restatement would read as padding.
 *
 * Hairline-divided to match the proof row it follows on /patent-idea-check, so
 * the column stays one document instead of a stack of boxes.
 */
const ITEMS = [
  { icon: FileText, text: "8-section pre-patent intelligence report (PDF)" },
  { icon: Certificate, text: "Timestamped Certificate of Idea Registration" },
  { icon: ShieldCheck, text: SECURE_LINE },
  { icon: Check, text: REFUND_LINE },
];

export function OfferStrip() {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 border-t border-line pt-7 sm:grid-cols-2">
      {ITEMS.map((item) => (
        <li key={item.text} className="flex items-start gap-2.5">
          <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-card">
            <item.icon aria-hidden className="h-3.5 w-3.5 text-gold" />
          </span>
          <span className="text-[13px] leading-snug text-ink-2">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
