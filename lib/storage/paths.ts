export type DocumentType = "report" | "certificate";

/** Objects live at {submission_id}/{file}. Deliberately NOT keyed on the owner:
 * a payment-first submission has no owner when its PDFs are written, and gains
 * one at claim time. The `read own documents` policy resolves ownership by
 * looking the submission up, so a claim makes the files readable with no move. */
export function documentPath(submissionId: string, type: DocumentType): string {
  return `${submissionId}/${type}.pdf`;
}
