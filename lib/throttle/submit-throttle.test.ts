import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc }) }));

import { allowSubmit, SUBMIT_LIMIT_PER_HOUR } from "@/lib/throttle/submit-throttle";

beforeEach(() => rpc.mockReset());

describe("allowSubmit", () => {
  it("passes the caller's IP and the limit to the database", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(allowSubmit("203.0.113.9")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("bump_submit_throttle", {
      p_ip: "203.0.113.9",
      p_limit: SUBMIT_LIMIT_PER_HOUR,
    });
  });

  it("blocks once the window limit is exceeded", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(allowSubmit("203.0.113.9")).resolves.toBe(false);
  });

  // Fail open: a throttle outage must never stop paying customers. The honeypot
  // is still in front of this, and the cost of a false block is a lost sale.
  it("allows the submit when the throttle itself fails", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "down" } });
    await expect(allowSubmit("203.0.113.9")).resolves.toBe(true);
  });

  it("allows the submit when no IP is available", async () => {
    await expect(allowSubmit("")).resolves.toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("passes a valid IPv4 address through to the RPC", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(allowSubmit("203.0.113.9")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("bump_submit_throttle", {
      p_ip: "203.0.113.9",
      p_limit: SUBMIT_LIMIT_PER_HOUR,
    });
  });

  it("passes a valid IPv6 address through to the RPC", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(allowSubmit("2001:db8::1")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("bump_submit_throttle", {
      p_ip: "2001:db8::1",
      p_limit: SUBMIT_LIMIT_PER_HOUR,
    });
  });

  it("passes an IPv4-mapped IPv6 address through to the RPC", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(allowSubmit("::ffff:203.0.113.9")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("bump_submit_throttle", {
      p_ip: "::ffff:203.0.113.9",
      p_limit: SUBMIT_LIMIT_PER_HOUR,
    });
  });

  // A non-inet value (e.g. a proxy sending the literal string "unknown", or
  // an IPv6-with-port) must never reach the RPC: an `inet` parse error there
  // is treated as a throttle outage and fails open, so a bad value would
  // disable the limit entirely instead of just being skipped like an absent IP.
  it("treats a junk value as absent — allows the submit without calling the RPC", async () => {
    await expect(allowSubmit("unknown")).resolves.toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });
});
