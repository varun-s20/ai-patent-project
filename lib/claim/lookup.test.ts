import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from }),
}));

import { lookupClaim } from "@/lib/claim/lookup";

/** Builds the chained-filter object the Supabase client returns, so the test
 * can assert on which filters were applied as well as on the outcome. Mirrors
 * the pattern in lib/claim/token.test.ts. */
function chain(result: { data: unknown; error: unknown }) {
  const calls: Record<string, unknown> = {};
  const self = {
    select: (cols: string) => ((calls["select"] = cols), self),
    eq: (col: string, val: unknown) => ((calls[`eq:${col}`] = val), self),
    is: (col: string, val: unknown) => ((calls[`is:${col}`] = val), self),
    maybeSingle: async () => result,
    calls,
  };
  return self;
}

describe("lookupClaim", () => {
  beforeEach(() => from.mockReset());

  it("returns null without querying the database when the token is missing", async () => {
    const result = await lookupClaim(undefined);
    expect(result).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("returns null without querying the database when the token is empty", async () => {
    const result = await lookupClaim("");
    expect(result).toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it("filters on the unowned row (user_id IS NULL) and the token", async () => {
    const c = chain({
      data: { email: "a@b.co", inventor_name: "Ada", title: "Widget" },
      error: null,
    });
    from.mockReturnValue(c);

    await lookupClaim("tok");

    expect(from).toHaveBeenCalledWith("submissions");
    // This filter is the only thing standing between a spent token and the
    // email/name of an already-claimed submission — a claimed row (user_id
    // set) must never match.
    expect(c.calls["is:user_id"]).toBeNull();
    expect(c.calls["eq:claim_token"]).toBe("tok");
  });

  it("returns null when no row matches (spent or wrong token)", async () => {
    from.mockReturnValue(chain({ data: null, error: null }));
    const result = await lookupClaim("gone");
    expect(result).toBeNull();
  });

  describe("on a database error", () => {
    let errSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => errSpy.mockRestore());

    it("returns null rather than throwing, and logs the failure", async () => {
      from.mockReturnValue(chain({ data: null, error: { message: "boom" } }));
      const result = await lookupClaim("tok");
      expect(result).toBeNull();
      // Distinguishes the error path from the plain not-found path above —
      // both return null, but only this one should log.
      expect(errSpy).toHaveBeenCalled();
    });
  });

  it("maps the row to email, fullName and title on a hit", async () => {
    from.mockReturnValue(
      chain({
        data: { email: "ada@example.com", inventor_name: "Ada Lovelace", title: "Analytical Engine" },
        error: null,
      }),
    );

    const result = await lookupClaim("tok");

    expect(result).toEqual({
      email: "ada@example.com",
      fullName: "Ada Lovelace",
      title: "Analytical Engine",
    });
  });
});
