import { describe, it, expect } from "vitest";
import { clearDraft, DRAFT_KEY } from "./draft-storage";

describe("draft-storage", () => {
  it("clears a legacy draft key", () => {
    localStorage.setItem(DRAFT_KEY, "{}");
    clearDraft();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
