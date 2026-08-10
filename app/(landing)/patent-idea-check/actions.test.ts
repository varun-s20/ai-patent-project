import { describe, expect, it, vi, beforeEach } from "vitest";

// Typed so `.mock.calls[0][...]`, `.mockResolvedValue(...)`, and
// `.mockResolvedValueOnce(...)` below type-check under strict mode — vi.fn()
// otherwise infers the narrowest possible shape from this initial
// implementation.
// One lead row per idea now (0016) — an insert, not an upsert on email.
const leadInsert = vi.fn(
  async (
    _payload: Record<string, unknown>,
  ): Promise<{ error: { message: string } | null }> => ({ error: null }),
);
const insert = vi.fn();
const update = vi.fn(() => ({ eq: async () => ({ error: null }) }));
const getUser = vi.fn(
  async (): Promise<{ data: { user: { id: string } | null } }> => ({ data: { user: null } }),
);
// Backs the is_disabled guard's .from("profiles").select().eq().single()
// chain on the per-request client. Only ever reached on the logged-in
// branch; defaults to "not disabled" so the pre-existing logged-in test
// keeps passing untouched.
const profileSingle = vi.fn(
  async (): Promise<{ data: { is_disabled: boolean } | null; error: { message: string } | null }> => ({
    data: { is_disabled: false },
    error: null,
  }),
);
const sessionsCreate = vi.fn(
  async (
    _params: Record<string, unknown>,
    _opts: Record<string, unknown>,
  ) => ({ id: "cs_1", url: "https://stripe.test/pay" }),
);
// Two RPCs run through here: allowSubmit()'s throttle check and the
// email→account lookup that decides whether the idea is owned at insert.
// Dispatched by name so a test can steer one without disturbing the other.
const allowSubmitRpc = vi.fn(async (): Promise<{ data: boolean; error: null }> => ({
  data: true,
  error: null,
}));
const ownerLookupRpc = vi.fn(
  async (): Promise<{ data: string | null; error: { message: string } | null }> => ({
    data: null,
    error: null,
  }),
);
const rpc = vi.fn(async (name: string, args?: Record<string, unknown>) => {
  void args;
  return name === "confirmed_user_id_for_email" ? ownerLookupRpc() : allowSubmitRpc();
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) =>
      table === "leads" ? { insert: leadInsert } : { insert, update },
    rpc,
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ single: profileSingle }) }) }),
  }),
}));
vi.mock("@/lib/stripe/client", () => ({
  getStripe: () => ({ checkout: { sessions: { create: sessionsCreate } } }),
  SITE: "registry",
  siteMeta: (m: Record<string, string>) => m,
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT:${to}`);
  },
}));
// No x-forwarded-for by default, so allowSubmit() sees an empty IP and
// short-circuits without touching the (also-mocked) admin client's `.rpc`.
// The throttle test below points this at a real IP for one case; beforeEach
// resets it to null so that can't leak into any other test.
let forwardedFor: string | null = null;
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (name: string) => (name === "x-forwarded-for" ? forwardedFor : null) }),
}));

import { startEvaluation } from "./actions";
import { HONEYPOT_FIELD } from "@/lib/validation/lead";

function form(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const base: Record<string, string> = {
    fullName: "Priya Raghunathan",
    email: "Priya@Northfield.io",
    country: "US",
    phone: "+14155550132",
    title: "Self-cleaning irrigation drip valve",
    description:
      "A drip emitter with a pressure-cycled silicone diaphragm that flexes once per irrigation cycle, shedding mineral scale without filters or manual flushing.",
    industry: "Agriculture",
  };
  for (const [k, v] of Object.entries({ ...base, ...overrides })) fd.set(k, v);
  return fd;
}

async function caught(fd: FormData): Promise<string> {
  try {
    await startEvaluation({}, fd);
  } catch (err) {
    return (err as Error).message;
  }
  return "NO_REDIRECT";
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_BASE_URL = "https://x.test";
  insert.mockReturnValue({
    select: () => ({ single: async () => ({ data: { id: "sub-1" }, error: null }) }),
  });
  // Reset alongside insert so a failure primed in one test (see the two
  // failure-path tests below) can't leak its mocked rejection into the next.
  leadInsert.mockResolvedValue({ error: null });
  getUser.mockResolvedValue({ data: { user: null } });
  profileSingle.mockResolvedValue({ data: { is_disabled: false }, error: null });
  // "Allow" by default; the throttle test overrides this for its one call.
  allowSubmitRpc.mockResolvedValue({ data: true, error: null });
  // No pre-existing account for this email by default.
  ownerLookupRpc.mockResolvedValue({ data: null, error: null });
  forwardedFor = null;
  [leadInsert, insert, update, sessionsCreate, rpc, allowSubmitRpc, ownerLookupRpc, profileSingle].forEach(
    (m) => m.mockClear(),
  );
});

describe("startEvaluation", () => {
  it("saves the lead and the idea, then redirects to Stripe", async () => {
    expect(await caught(form())).toBe("REDIRECT:https://stripe.test/pay");

    // The lead row is what makes an abandoned checkout followable up.
    expect(leadInsert).toHaveBeenCalledOnce();
    const lead = leadInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(lead.email).toBe("priya@northfield.io");
    expect(lead.title).toBe("Self-cleaning irrigation drip valve");

    const row = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.user_id).toBeNull();
    expect(row.status).toBe("draft");
    expect(row.email).toBe("priya@northfield.io");
    expect(typeof row.claim_token).toBe("string");

    // Deterministic per submission: the guard against a double-click minting
    // a second live $49 charge for the same idea.
    expect(sessionsCreate.mock.calls[0][1]).toEqual({ idempotencyKey: "checkout-sub-1" });
  });

  it("attaches the idea immediately when someone is already logged in", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-9" } } });
    await caught(form());
    const row = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.user_id).toBe("user-9");
    expect(row.claim_token).toBeNull();
  });

  it("attaches the idea when the email already has a confirmed account", async () => {
    // Signed out, but this address is already someone's login. The draft has
    // to be theirs at insert or it stays invisible to them under RLS — the
    // whole reason unpaid ideas stopped appearing on the dashboard.
    ownerLookupRpc.mockResolvedValueOnce({ data: "user-7", error: null });

    expect(await caught(form())).toBe("REDIRECT:https://stripe.test/pay");

    const row = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.user_id).toBe("user-7");
    // Owned already — a claim token would have nothing left to hand over.
    expect(row.claim_token).toBeNull();
    // Lowercased before the lookup: the form posts "Priya@Northfield.io".
    expect(
      rpc.mock.calls.some(
        ([n, a]) => n === "confirmed_user_id_for_email" && a?.p_email === "priya@northfield.io",
      ),
    ).toBe(true);
  });

  it("falls back to the claim flow when the account lookup errors", async () => {
    ownerLookupRpc.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    expect(await caught(form())).toBe("REDIRECT:https://stripe.test/pay");

    const row = insert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.user_id).toBeNull();
    expect(typeof row.claim_token).toBe("string");
  });

  it("writes one lead per idea, tied to the submission it came with", async () => {
    // The old upsert on email meant a second invention overwrote the first.
    await caught(form());
    await caught(form({ title: "Second invention", description: "x".repeat(150) }));

    expect(leadInsert).toHaveBeenCalledTimes(2);
    const titles = leadInsert.mock.calls.map(([row]) => row.title);
    expect(titles).toEqual(["Self-cleaning irrigation drip valve", "Second invention"]);
    for (const [row] of leadInsert.mock.calls) expect(row.submission_id).toBe("sub-1");
  });

  it("refuses a disabled logged-in user before Stripe", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-9" } } });
    profileSingle.mockResolvedValueOnce({ data: { is_disabled: true }, error: null });

    const result = await startEvaluation({}, form());

    expect(result.error).toMatch(/disabled/i);
    expect(insert).not.toHaveBeenCalled();
    expect(leadInsert).not.toHaveBeenCalled();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("denies access when the is_disabled lookup fails, fail-closed", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-9" } } });
    profileSingle.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const result = await startEvaluation({}, form());

    expect(result.error).toBeTruthy();
    expect(insert).not.toHaveBeenCalled();
    expect(leadInsert).not.toHaveBeenCalled();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("writes nothing when the honeypot is filled", async () => {
    const fd = form();
    fd.set(HONEYPOT_FIELD, "https://spam.example");
    expect(await caught(fd)).toBe("REDIRECT:/");
    expect(leadInsert).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("blocks the submit when the IP has hit the hourly throttle, before any writes", async () => {
    forwardedFor = "203.0.113.9";
    allowSubmitRpc.mockResolvedValueOnce({ data: false, error: null });

    // Awaited directly, not through caught(): a throttle block must return an
    // error, not redirect — same reasoning as the submission-save-failure test.
    const result = await startEvaluation({}, form());

    expect(result.error).toMatch(/lot of ideas/i);
    // Nothing downstream of the throttle check may run: no draft row, no
    // marketing lead, and — the whole point — no Stripe API call.
    expect(insert).not.toHaveBeenCalled();
    expect(leadInsert).not.toHaveBeenCalled();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns a field error without charging anyone", async () => {
    const result = await startEvaluation({}, form({ description: "too short" }));
    // Keyed by field name so the form can mark that input, not banner it —
    // a top-level `error` here would render a summary above the fields.
    expect(result.fieldErrors?.description).toMatch(/at least 100 characters/);
    expect(result.error).toBeUndefined();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("keys every rejected field, not only the first", async () => {
    const result = await startEvaluation(
      {},
      form({ description: "too short", email: "not-an-email" }),
    );
    expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual(["description", "email"]);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("keys the phone/country mismatch onto the phone field", async () => {
    // The cross-field refine carries path: ["phone"] — without that the message
    // would have nowhere to render.
    const result = await startEvaluation({}, form({ country: "AU", phone: "+14155550132" }));
    expect(result.fieldErrors?.phone).toMatch(/valid phone number/i);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("surfaces a submission save failure and never reaches Stripe", async () => {
    insert.mockReturnValue({
      select: () => ({ single: async () => ({ data: null, error: { message: "boom" } }) }),
    });

    // Awaited directly rather than through caught(): a submission failure
    // must return, not redirect, so an uncaught throw here (redirect() firing
    // anyway) fails this test loudly instead of the assertions below silently
    // proving nothing.
    const result = await startEvaluation({}, form());
    expect(result.error).toBeTruthy();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("still redirects to Stripe when the lead insert fails", async () => {
    // The submission — the thing actually being paid for — is unaffected;
    // only the marketing-table write is failing here.
    leadInsert.mockResolvedValueOnce({ error: { message: "boom" } });

    // A lead failure is logged, not surfaced: it must never cost a sale.
    expect(await caught(form())).toBe("REDIRECT:https://stripe.test/pay");
  });
});
