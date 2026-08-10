import { describe, expect, it } from "vitest";
import { publicSubmissionFields, publicSubmissionSchema } from "@/lib/validation/public-submission";

const valid = {
  fullName: "Priya Raghunathan",
  email: "Priya@Northfield.io",
  country: "US",
  phone: "+1 415 555 0132",
  title: "Self-cleaning irrigation drip valve",
  description:
    "A drip emitter with a pressure-cycled silicone diaphragm that flexes once per irrigation cycle, shedding mineral scale without filters or manual flushing.",
  industry: "Agriculture",
};

describe("publicSubmissionSchema", () => {
  it("accepts a complete idea with contact details", () => {
    const parsed = publicSubmissionSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("keeps the paid form's description floor — this feeds the evaluation", () => {
    const parsed = publicSubmissionSchema.safeParse({ ...valid, description: "Too short." });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toMatch(/at least 100 characters/);
  });

  it("rejects a phone number that is not valid for the chosen country", () => {
    const parsed = publicSubmissionSchema.safeParse({ ...valid, country: "GB", phone: "+1 415 555 0132" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(["phone"]);
  });

  it("requires an industry from the fixed list", () => {
    const parsed = publicSubmissionSchema.safeParse({ ...valid, industry: "Aerospace" });
    expect(parsed.success).toBe(false);
  });

  it("treats attribution as optional visitor-supplied text and caps it", () => {
    const ok = publicSubmissionSchema.safeParse({ ...valid, utmCampaign: "spring-ideas" });
    expect(ok.success).toBe(true);
    const tooLong = publicSubmissionSchema.safeParse({ ...valid, utmCampaign: "x".repeat(201) });
    expect(tooLong.success).toBe(false);
  });

  it("does not ask for stage or patent type", () => {
    expect(Object.keys(publicSubmissionFields.shape)).not.toContain("stage");
    expect(Object.keys(publicSubmissionFields.shape)).not.toContain("patentType");
  });

  // libphonenumber-js returns an undefined `country` for shared-NANP/toll-free
  // ranges — that must read as "no country to disagree with," not a mismatch.
  it("accepts a US toll-free number under a US selection", () => {
    const parsed = publicSubmissionSchema.safeParse({ ...valid, country: "US", phone: "+1 800 555 0199" });
    expect(parsed.success).toBe(true);
  });

  it("does not throw on malformed + prefix", () => {
    const result = publicSubmissionSchema.safeParse({ ...valid, phone: "+" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["phone"]);
  });
});
