import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock is hoisted above the imports, so its factories can only close over
// values hoisted with it.
const { upsert, sendEmail } = vi.hoisted(() => ({
  // Typed parameters, so the assertions below can read the payload without a
  // cast. Voided rather than ignored: the mock doesn't need them, but an
  // argument nothing references trips the unused-vars lint.
  upsert: vi.fn(async (payload: Record<string, unknown>, options?: { onConflict?: string }) => {
    void payload;
    void options;
    return { error: null as { message: string } | null };
  }),
  sendEmail: vi.fn(async () => {}),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ upsert }) }),
}));
vi.mock("@/lib/email/send", () => ({ sendEmail }));

// The real redirect() signals by throwing an internal error; this stands in for
// it with a recognisable one so a test can assert *where* the action went.
const REDIRECT = "REDIRECT:";
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`${REDIRECT}${path}`);
  },
}));

const THANKS = "REDIRECT:/patent-idea-check/thanks";

/** Runs the action and returns either its state or the path it redirected to. */
async function run(formData: FormData): Promise<{ state?: LeadState; redirected?: string }> {
  try {
    return { state: await createLead({}, formData) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith(REDIRECT)) return { redirected: message };
    throw err;
  }
}

import { createLead, type LeadState } from "./actions";
import { HONEYPOT_FIELD } from "@/lib/validation/lead";

// leadWelcomeEmail refuses to build a link-less email, so the flow needs a base
// URL the same way production does.
process.env.NEXT_PUBLIC_BASE_URL = "https://example.test";
process.env.GMAIL_USER = "admin@example.test";

function form(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const values: Record<string, string> = {
    fullName: "Ada Lovelace",
    email: "Ada@Example.com",
    country: "US",
    phone: "2015550123",
    stage: "Just an idea",
    patentType: "Utility patent",
    utm_campaign: "",
    ...overrides,
  };
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("createLead", () => {
  beforeEach(() => {
    upsert.mockClear();
    sendEmail.mockClear();
    upsert.mockImplementation(async () => ({ error: null }));
  });

  it("saves a lead, lowercasing the email so the unique constraint dedupes", async () => {
    const { redirected } = await run(form());

    // The thank-you URL is the ad platform's conversion event, so where this
    // lands is part of the contract, not an implementation detail.
    expect(redirected).toBe(THANKS);
    expect(upsert).toHaveBeenCalledTimes(1);
    const [payload, options] = upsert.mock.calls[0];
    expect(payload.email).toBe("ada@example.com");
    expect(payload.full_name).toBe("Ada Lovelace");
    expect(payload.stage).toBe("Just an idea");
    expect(payload.patent_type).toBe("Utility patent");
    expect(payload.country).toBe("US");
    // Stored in E.164, not whatever formatting the visitor typed.
    expect(payload.phone).toBe("+12015550123");
    // Empty optional attribution fields become null, never "".
    expect(payload.utm_campaign).toBeNull();
    expect(options).toEqual({ onConflict: "email" });
    // Welcome email to the lead, notification to the admin.
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("silently drops a submission with the honeypot filled", async () => {
    const { redirected } = await run(form({ [HONEYPOT_FIELD]: "http://spam.example" }));

    // Indistinguishable from success so a bot learns nothing, but nothing is
    // written and nothing is sent.
    expect(redirected).toBe(THANKS);
    expect(upsert).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a bad email without writing", async () => {
    const { state, redirected } = await run(form({ email: "not-an-email" }));

    expect(state?.error).toBeTruthy();
    expect(redirected).toBeUndefined();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a stage that isn't one of ours", async () => {
    const { state } = await run(form({ stage: "Filed already" }));

    expect(state?.error).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a patent type that isn't one of ours", async () => {
    const { state } = await run(form({ patentType: "Copyright" }));

    expect(state?.error).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a missing phone number", async () => {
    const { state } = await run(form({ phone: "" }));

    expect(state?.error).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a country not in the list", async () => {
    const { state } = await run(form({ country: "Narnia" }));

    expect(state?.error).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects a phone number that isn't valid for the selected country", async () => {
    const { state } = await run(form({ phone: "123" }));

    expect(state?.error).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("reports a save failure instead of redirecting to the thank-you page", async () => {
    upsert.mockImplementation(async () => ({ error: { message: "boom" } }));
    const { state, redirected } = await run(form());

    expect(redirected).toBeUndefined();
    expect(state?.error).toMatch(/couldn't save/i);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still confirms the lead when the emails fail", async () => {
    sendEmail.mockImplementation(async () => {
      throw new Error("smtp down");
    });
    const { redirected } = await run(form());

    // The row is saved; a mail failure must never read as a failed submit.
    expect(redirected).toBe(THANKS);
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});
