import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ update }) }),
}));

import { claimForUser, newClaimToken } from "@/lib/claim/token";

/** Builds the chained-filter object the Supabase client returns, so the test
 * can assert on which filters were applied as well as on the outcome. */
function chain(result: { data: unknown; error: unknown }) {
  const calls: Record<string, unknown> = {};
  const self = {
    eq: (col: string, val: unknown) => ((calls[`eq:${col}`] = val), self),
    is: (col: string, val: unknown) => ((calls[`is:${col}`] = val), self),
    select: () => self,
    maybeSingle: async () => result,
    calls,
  };
  return self;
}

describe("newClaimToken", () => {
  it("is URL-safe and long enough to be unguessable", () => {
    const token = newClaimToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("does not repeat", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => newClaimToken()));
    expect(tokens.size).toBe(200);
  });
});

describe("claimForUser", () => {
  beforeEach(() => update.mockReset());

  it("claims an unowned row and reports its id", async () => {
    const c = chain({ data: { id: "sub-1" }, error: null });
    update.mockReturnValue(c);

    const result = await claimForUser({
      userId: "user-1",
      email: "Ada@Example.com",
      token: "tok",
    });

    expect(result).toEqual({ ok: true, submissionId: "sub-1" });
    expect(update).toHaveBeenCalledWith({ user_id: "user-1", claim_token: null });
    // Spendable once: the row must still be unowned.
    expect(c.calls["is:user_id"]).toBeNull();
    // user_metadata is client-writable, so the token alone is not enough —
    // the row's email must match the account's, compared lowercased.
    expect(c.calls["eq:email"]).toBe("ada@example.com");
    expect(c.calls["eq:claim_token"]).toBe("tok");
  });

  it("reports not-found when the token is spent or wrong", async () => {
    update.mockReturnValue(chain({ data: null, error: null }));
    const result = await claimForUser({ userId: "u", email: "a@b.co", token: "gone" });
    expect(result).toEqual({ ok: false, reason: "not-found" });
  });

  it("reports error separately from not-found so a DB failure is not silent", async () => {
    update.mockReturnValue(chain({ data: null, error: { message: "boom" } }));
    const result = await claimForUser({ userId: "u", email: "a@b.co", token: "t" });
    expect(result).toEqual({ ok: false, reason: "error" });
  });
});
