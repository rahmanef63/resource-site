import { describe, expect, it } from "vitest";
import { countAt, easeOutCubic, staggerDelay } from "./core";

describe("motion-kit core", () => {
  it("caps stagger delays deterministically", () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(3)).toBe(240);
    expect(staggerDelay(9)).toBe(400);
    expect(staggerDelay(-1)).toBe(0);
  });

  it("clamps easing progress", () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(2)).toBe(1);
  });

  it("computes count-up values from the shared easing", () => {
    expect(countAt(100, 0)).toBe(0);
    expect(countAt(100, 1)).toBe(100);
    expect(countAt(100, 0.5)).toBe(88);
  });
});
