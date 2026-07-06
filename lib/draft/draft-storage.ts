export const DRAFT_KEY = "air:submission-draft";

/** Purges any draft left over from before autosave/restore was removed. */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
