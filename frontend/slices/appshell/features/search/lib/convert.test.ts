import { describe, expect, it } from "vitest";
import { convert } from "./convert";

describe("convert (small static unit table, within-dimension only)", () => {
  it("converts length (10 km → mi)", () => {
    expect(convert("10 km to mi")?.startsWith("6.21")).toBe(true);
  });

  it("converts mass (1 kg → lb)", () => {
    expect(convert("1 kg to lb")?.startsWith("2.20")).toBe(true);
  });

  it("converts temperature with the offset formula (0 °C → °F)", () => {
    expect(convert("0 c to f")).toBe("32 °F");
  });

  it("accepts 'in' as the connector word too", () => {
    expect(convert("100 cm in m")).toBe("1 m");
  });

  it("returns null for cross-dimension and non-conversions", () => {
    expect(convert("10 km to kg")).toBe(null); // cross-dimension
    expect(convert("km to kg")).toBe(null); // no number
    expect(convert("hello")).toBe(null); // plain search
    expect(convert("5")).toBe(null); // bare number
  });

  it("returns null when the conversion overflows to Infinity", () => {
    // a finite but huge input whose product overflows → must NOT show "= 0 mm"
    expect(convert("1".padEnd(306, "0") + " km to mm")).toBe(null);
  });
});
