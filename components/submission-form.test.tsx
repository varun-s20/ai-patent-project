import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/app/(app)/submit/actions", () => ({
  createSubmission: vi.fn(async () => ({ id: "sub_123" })),
}));

import { SubmissionForm } from "@/components/submission-form";
import { DRAFT_KEY } from "@/lib/draft/draft-storage";
import { INDUSTRIES } from "@/lib/types";

async function fillIdea(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.type(screen.getByLabelText("Invention title"), title);
  await user.type(
    screen.getByLabelText(/Description/i),
    "A reasonably detailed description of how this invention works in practice.",
  );
  await user.selectOptions(screen.getByLabelText(/Industry/i), INDUSTRIES[0]);
  await user.type(screen.getByLabelText(/Inventor full name/i), "Ada Lovelace");
  // Email is prefilled from the logged-in user; replace it rather than append.
  const email = screen.getByLabelText(/Email/i);
  await user.clear(email);
  await user.type(email, "ada@example.com");
}

describe("SubmissionForm", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("prefills only the logged-in email and saves no draft as you type", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm userEmail="ada@example.com" />);

    // Email is the one prefilled field; everything else starts blank.
    expect((screen.getByLabelText(/Email/i) as HTMLInputElement).value).toBe("ada@example.com");
    expect((screen.getByLabelText("Invention title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/Industry/i) as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText(/Inventor full name/i) as HTMLInputElement).value).toBe("");

    // Typing no longer autosaves anything to storage.
    await fillIdea(user, "First Idea");
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("purges a legacy draft on mount so a past session's answers never resurface", async () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ inventorName: "Old Name", industry: INDUSTRIES[1] }),
    );
    render(<SubmissionForm userEmail="ada@example.com" />);

    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toBeNull());
    expect((screen.getByLabelText(/Inventor full name/i) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/Industry/i) as HTMLSelectElement).value).toBe("");
  });

  it("wipes every field after a successful submission", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm userEmail="ada@example.com" />);

    await fillIdea(user, "First Idea");
    await user.click(screen.getByRole("button", { name: /get my report/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/pay/sub_123"));

    // The previous idea's content must not linger in the form.
    expect((screen.getByLabelText("Invention title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/Description/i) as HTMLTextAreaElement).value).toBe("");
    expect((screen.getByLabelText(/Inventor full name/i) as HTMLInputElement).value).toBe("");
  });
});
