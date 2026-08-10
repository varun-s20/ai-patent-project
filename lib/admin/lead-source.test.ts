import { describe, expect, it } from "vitest";
import { NOT_SITE_FORM, SITE_FORM_PATH, leadSource } from "./lead-source";

describe("leadSource", () => {
  it("reads the main site's own form as the site", () => {
    expect(leadSource("/submit")).toBe("site");
  });

  it("reads the ad landing page — and any future one — as a landing page", () => {
    expect(leadSource("/patent-idea-check")).toBe("landing");
    expect(leadSource("/free-patent-check")).toBe("landing");
  });

  it("reads a lead captured before landing_path existed as a landing page", () => {
    expect(leadSource(null)).toBe("landing");
    expect(leadSource(undefined)).toBe("landing");
  });
});

describe("NOT_SITE_FORM", () => {
  // The whole point of the or(): a bare neq drops null rows, which are exactly
  // the pre-landing_path landing-page leads this filter must keep.
  it("keeps nulls alongside everything that isn't the site form", () => {
    expect(NOT_SITE_FORM).toBe(`landing_path.is.null,landing_path.neq.${SITE_FORM_PATH}`);
  });
});
