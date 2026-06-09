import { describe, it, expect, beforeEach } from "vitest";
import { saveDraft, loadDraft, clearDraft, DRAFT_KEY } from "./draft-storage";

const draft = { title: "Idea", description: "desc", industry: "Other" };

describe("draft-storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when no draft is stored", () => {
    expect(loadDraft()).toBeNull();
  });

  it("round-trips a saved draft", () => {
    saveDraft(draft);
    expect(loadDraft()).toEqual(draft);
  });

  it("writes under the documented key", () => {
    saveDraft(draft);
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });

  it("clears a draft", () => {
    saveDraft(draft);
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it("returns null on corrupted JSON instead of throwing", () => {
    localStorage.setItem(DRAFT_KEY, "{not json");
    expect(loadDraft()).toBeNull();
  });
});
