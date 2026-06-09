import { describe, it, expect } from "vitest";
import { submissionSchema, DESCRIPTION_MIN, DESCRIPTION_MAX } from "./submission";

const valid = {
  title: "GPS Golf Ball",
  description: "x".repeat(150),
  problem: "Lost balls",
  industry: "Sports & Recreation",
  inventorName: "Jane Doe",
  email: "jane@example.com",
};

describe("submissionSchema", () => {
  it("accepts a valid submission", () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(submissionSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it(`rejects a description under ${DESCRIPTION_MIN} chars`, () => {
    const r = submissionSchema.safeParse({ ...valid, description: "x".repeat(DESCRIPTION_MIN - 1) });
    expect(r.success).toBe(false);
  });

  it(`rejects a description over ${DESCRIPTION_MAX} chars`, () => {
    const r = submissionSchema.safeParse({ ...valid, description: "x".repeat(DESCRIPTION_MAX + 1) });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown industry", () => {
    expect(submissionSchema.safeParse({ ...valid, industry: "Banking" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(submissionSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("allows an omitted problem field", () => {
    const { problem, ...rest } = valid;
    void problem;
    expect(submissionSchema.safeParse(rest).success).toBe(true);
  });
});
