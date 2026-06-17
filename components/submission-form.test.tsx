import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  await user.type(screen.getByLabelText(/Email/i), "ada@example.com");
}

describe("SubmissionForm draft lifecycle", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
  });

  it("wipes every field and the saved draft after a successful submission", async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);

    await fillIdea(user, "First Idea");
    expect(localStorage.getItem(DRAFT_KEY)).toContain("First Idea");

    await user.click(screen.getByRole("button", { name: /get my report/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/pay/sub_123"));

    // The reported bug: the previous idea's content lingers in the form.
    expect((screen.getByLabelText("Invention title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/Description/i) as HTMLTextAreaElement).value).toBe("");
    expect((screen.getByLabelText(/Inventor full name/i) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText(/Email/i) as HTMLInputElement).value).toBe("");
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });
});
