export type DocumentType = "report" | "certificate";

export function documentPath(
  userId: string,
  submissionId: string,
  type: DocumentType,
): string {
  return `${userId}/${submissionId}/${type}.pdf`;
}
