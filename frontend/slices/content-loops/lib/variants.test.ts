import { describe, expect, it } from "vitest";
import { loopVariantIndex } from "./variants";

describe("loopVariantIndex", () => {
  it("round-robins items across variants", () => {
    expect([0, 1, 2, 3, 4, 5].map((index) => loopVariantIndex(index, 2))).toEqual([0, 1, 0, 1, 0, 1]);
  });

  it("rejects missing variants", () => {
    expect(() => loopVariantIndex(0, 0)).toThrow("at least one variant");
  });
});
