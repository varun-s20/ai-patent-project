export type DocumentType = "report" | "certificate";

export function documentPath(
  userId: string,
  submissionId: string,
  type: DocumentType,
): string {
  return `${userId}/${submissionId}/${type}.pdf`;
}

export function assertOwnership(
  row: { user_id: string },
  userId: string,
): void {
  if (row.user_id !== userId) {
    throw new Error("Forbidden");
  }
}
