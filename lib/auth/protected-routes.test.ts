import { describe, expect, it } from "vitest";
import { needsAuth, safeNextPath } from "@/lib/auth/protected-routes";

describe("needsAuth", () => {
  // Everything that shows a paid report, spends money, or edits an idea. Each
  // of these was reachable by a disabled account while the list only named
  // /submit, /dashboard and /admin — disabling a user stopped their next login
  // but not their current session's access to reports and Stripe checkout.
  it.each([
    "/submit",
    "/dashboard",
    "/account",
    "/status/8f0c1e2a-0000-4000-8000-000000000000",
    "/pay/8f0c1e2a-0000-4000-8000-000000000000",
    "/edit/8f0c1e2a-0000-4000-8000-000000000000",
    "/admin",
    "/admin/submissions",
  ])("protects %s", (path) => {
    expect(needsAuth(path)).toBe(true);
  });

  // Public by design: the marketing funnel, auth screens, and the certificate
  // verification page a customer shares with people who have no account.
  it.each([
    "/",
    "/login",
    "/register",
    "/patent-idea-check",
    "/verify/GC-AI-2026-A1B2C3",
  ])("leaves %s public", (path) => {
    expect(needsAuth(path)).toBe(false);
  });

  // A prefix must match a path segment, never a substring — "/submitted" is
  // not "/submit", and a bare startsWith() would have said otherwise.
  it("matches whole segments only", () => {
    expect(needsAuth("/submitters")).toBe(false);
    expect(needsAuth("/administrator")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("keeps an in-app path, query string and all", () => {
    expect(safeNextPath("/status/abc")).toBe("/status/abc");
    expect(safeNextPath("/admin/submissions?status=paid&page=2")).toBe(
      "/admin/submissions?status=paid&page=2",
    );
  });

  // `next` comes straight off the URL, so it is attacker-controlled. Anything
  // that can leave this origin must fall back — a login form that forwards to
  // an arbitrary host is a credential-phishing primitive.
  it.each([
    "https://evil.example/login",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "dashboard",
    "",
  ])("refuses %p", (raw) => {
    expect(safeNextPath(raw)).toBe("/dashboard");
  });

  it("falls back when absent", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });
});
