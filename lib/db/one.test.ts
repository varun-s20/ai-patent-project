import { describe, it, expect } from "vitest";
import { one } from "@/lib/db/one";

describe("one", () => {
  it("returns the object as-is", () => {
    expect(one({ a: 1 })).toEqual({ a: 1 });
  });
  it("returns the first element of an array", () => {
    expect(one([{ a: 1 }, { a: 2 }])).toEqual({ a: 1 });
  });
  it("returns null for empty array / null / undefined", () => {
    expect(one([])).toBeNull();
    expect(one(null)).toBeNull();
    expect(one(undefined)).toBeNull();
  });
});
