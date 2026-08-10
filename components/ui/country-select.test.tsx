import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CountrySelect } from "@/components/ui/country-select";

afterEach(cleanup);

/** The hidden input is what the form actually posts; the trigger is only what
 * the visitor sees. These drifted apart once — the trigger read "Australia"
 * while the input posted "", so the server answered "Select a country" about a
 * form that was visibly showing one. */
function postedValue(): string {
  const input = document.querySelector<HTMLInputElement>('input[name="country"]');
  if (!input) throw new Error("country hidden input not rendered");
  return input.value;
}

describe("CountrySelect", () => {
  it("posts Australia by default, matching what the trigger shows", () => {
    render(<CountrySelect name="country" />);

    expect(postedValue()).toBe("AU");
    expect(screen.getByRole("button", { name: "Country" })).toHaveTextContent("Australia");
  });

  it("honours an explicit default over the built-in one", () => {
    render(<CountrySelect name="country" defaultValue="GB" />);

    expect(postedValue()).toBe("GB");
    expect(screen.getByRole("button", { name: "Country" })).toHaveTextContent(
      "United Kingdom",
    );
  });
});
