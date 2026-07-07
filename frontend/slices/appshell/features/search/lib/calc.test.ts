import { describe, expect, it } from "vitest";
import { evaluate } from "./calc";

describe("evaluate (safe arithmetic, no eval)", () => {
  it("folds the basic operators and parentheses", () => {
    expect(evaluate("2+2")).toBe(4);
    expect(evaluate("3 * (4+1)")).toBe(15);
    expect(evaluate("10/4")).toBe(2.5);
  });

  it("accepts the × and ÷ unicode glyphs", () => {
    expect(evaluate("6 × 7")).toBe(42);
    expect(evaluate("9 ÷ 3")).toBe(3);
  });

  it("returns null for non-arithmetic text and bare numbers", () => {
    expect(evaluate("files")).toBe(null); // plain search stays a search
    expect(evaluate("5")).toBe(null); // no operator → not a result row
  });

  it("guards divide-by-zero", () => {
    expect(evaluate("1/0")).toBe(null);
  });

  it("rejects juxtaposed values with no operator between them", () => {
    expect(evaluate("2 3 *")).toBe(null); // not a valid infix reading
    expect(evaluate("10 5*")).toBe(null);
    expect(evaluate("(1)(2)")).toBe(null);
    expect(evaluate("2 * 2")).toBe(4); // a real op between them still works
  });
});
