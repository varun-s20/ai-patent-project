import { describe, expect, it } from "vitest";
import { adminReturnPath, noticeParam, parseNotice, withNotice } from "@/lib/admin/notice";

describe("notice round-trip", () => {
  it("survives encoding and decoding", () => {
    const url = withNotice("/admin/submissions?status=paid", "error", "Stripe refused: no such pi");
    const raw = new URL(url, "https://x").searchParams.get("notice") ?? undefined;
    expect(parseNotice(raw)).toEqual({ tone: "error", text: "Stripe refused: no such pi" });
  });

  it("keeps the filters already on the return path", () => {
    const url = withNotice("/admin/users?role=admin&page=2", "ok", "Done");
    expect(url).toContain("role=admin");
    expect(url).toContain("page=2");
  });

  it("replaces a previous notice rather than stacking one", () => {
    const once = withNotice("/admin/users", "error", "First");
    const twice = withNotice(once, "ok", "Second");
    expect(twice.match(/notice=/g)).toHaveLength(1);
    expect(parseNotice(new URL(twice, "https://x").searchParams.get("notice")!)?.text).toBe("Second");
  });

  it("rejects junk instead of rendering it", () => {
    expect(parseNotice(undefined)).toBeNull();
    expect(parseNotice("")).toBeNull();
    expect(parseNotice("boom")).toBeNull();
    expect(parseNotice("hacker:text")).toBeNull();
    expect(parseNotice("ok:")).toBeNull();
  });

  it("caps the text so a crafted URL cannot flood the page", () => {
    const long = parseNotice(noticeParam("ok", "x".repeat(5000)));
    expect(long!.text.length).toBe(300);
  });
});

describe("adminReturnPath", () => {
  it("keeps in-console paths", () => {
    expect(adminReturnPath("/admin/users?role=admin", "/admin/x")).toBe("/admin/users?role=admin");
  });

  it("refuses anything that could leave the console", () => {
    for (const bad of ["https://evil.test", "//evil.test", "/login", "admin/users", null, 7 as never]) {
      expect(adminReturnPath(bad as never, "/admin/submissions")).toBe("/admin/submissions");
    }
  });
});
